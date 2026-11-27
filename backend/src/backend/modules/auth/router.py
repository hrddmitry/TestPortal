from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.modules.auth.schemas import LoginRequest, TokenResponse
from backend.modules.auth.security import create_access_token, verify_password
from backend.modules.users.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


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
