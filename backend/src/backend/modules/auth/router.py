from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import backend.modules.groups.models  # noqa: F401
from backend.core.database import get_db
from backend.modules.auth.dependencies import get_current_user_id
from backend.modules.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    ProfileRead,
    ProfileUpdate,
    TokenResponse,
)
from backend.modules.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from backend.modules.users.crud import get_user
from backend.modules.users.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


def build_profile(user: User) -> ProfileRead:
    permissions = list(user.permissions)
    for role in user.roles:
        permissions.extend(role.permissions)

    permission_codes = {p.code for p in permissions}
    permission_names = {p.name for p in permissions}

    groups = getattr(user, "groups", [])

    return ProfileRead(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar=user.avatar,
        birthday=user.birthday,
        location=user.location,
        phone=user.phone,
        about=user.about,
        hired_at=user.hired_at,
        is_active=user.is_active,
        roles=sorted(role.name for role in user.roles),
        permissions=sorted(permission_codes),
        permission_names=sorted(permission_names),
        groups=sorted(g.name for g in groups if g.deleted_at is None),
    )


def load_current_user(db: Session, user_id: int) -> User:
    user = get_user(db, user_id)
    if user is None or user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    result = db.execute(
        select(User).where(
            User.email == payload.email.lower(),
            User.deleted_at.is_(None),
        )
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=ProfileRead)
def read_current_user(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> ProfileRead:
    return build_profile(load_current_user(db, current_user_id))


@router.patch("/me", response_model=ProfileRead)
def update_current_user(
    data: ProfileUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> ProfileRead:
    user = load_current_user(db, current_user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return build_profile(user)


@router.put("/me/password")
def change_current_user_password(
    data: ChangePasswordRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    user = load_current_user(db, current_user_id)
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"ok": True}
