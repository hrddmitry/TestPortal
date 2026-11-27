from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.modules.auth.permissions import require_permission
from backend.modules.auth.security import hash_password
from backend.modules.users import crud
from backend.modules.users.models import User
from backend.modules.users.schemas import SetPasswordRequest, UserCreate, UserRead

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=201)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users.manage")),
) -> UserRead:
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(status_code=409, detail="User with this email already exists")
    return crud.create_user(db, data)


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users.manage")),
) -> list[UserRead]:
    return crud.list_users(db)


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users.manage")),
) -> UserRead:
    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}/password")
def set_password(
    user_id: int,
    payload: SetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("users.manage")),
) -> dict[str, bool]:
    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.password)
    db.commit()
    return {"ok": True}
