from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"comment": "Пользователи портала"}

    id: Mapped[int] = mapped_column(
        primary_key=True, comment="Идентификатор пользователя"
    )
    password_hash: Mapped[str]

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        comment="Электронная почта, хранится в нижнем регистре",
    )
    first_name: Mapped[str | None] = mapped_column(
        String(100), comment="Имя"
    )
    last_name: Mapped[str | None] = mapped_column(
        String(100), comment="Фамилия"
    )
    avatar: Mapped[str | None] = mapped_column(
        String(500), comment="Ссылка на изображение профиля"
    )
    birthday: Mapped[date | None] = mapped_column(
        Date, comment="Дата рождения"
    )
    location: Mapped[str | None] = mapped_column(
        String(255), comment="Местоположение"
    )
    phone: Mapped[str | None] = mapped_column(
        String(50), comment="Телефон"
    )
    about: Mapped[str | None] = mapped_column(
        Text, comment="Информация о себе"
    )
    signature: Mapped[str | None] = mapped_column(
        String(500), comment="Подпись"
    )
    hired_at: Mapped[date | None] = mapped_column(
        Date, comment="Дата начала работы в компании"
    )
    is_active: Mapped[bool] = mapped_column(
        default=True, comment="Активен ли пользователь"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Когда создана запись",
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        comment="Когда последний раз изменена запись",
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        comment="Когда пользователь мягко удалён; NULL, если активен",
    )
