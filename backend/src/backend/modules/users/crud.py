from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.modules.users.models import User
from backend.modules.users.schemas import UserCreate


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        email=data.email,
        first_name=data.first_name,
        last_name=data.last_name,
        avatar=data.avatar,
        birthday=data.birthday,
        location=data.location,
        phone=data.phone,
        about=data.about,
        signature=data.signature,
        hired_at=data.hired_at,
        is_active=data.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def list_users(db: Session) -> list[User]:
    result = db.execute(select(User).order_by(User.id))
    return list(result.scalars().all())