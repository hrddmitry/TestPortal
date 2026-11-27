from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base
from backend.modules.users.models import User


group_members = Table(
    "group_members",
    Base.metadata,
    Column(
        "group_id",
        Integer,
        ForeignKey("groups.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Группа",
    ),
    Column(
        "user_id",
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Пользователь",
    ),
    Column(
        "added_at",
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Когда пользователь добавлен в группу",
    ),
    comment="Участники групп",
)


class Group(Base):
    __tablename__ = "groups"
    __table_args__ = {"comment": "Группы пользователей"}

    id: Mapped[int] = mapped_column(
        primary_key=True,
        comment="Идентификатор группы",
    )
    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        comment="Название группы",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        comment="Описание группы",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Когда создана группа",
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        comment="Когда группа последний раз изменена",
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        comment="Когда группа мягко удалена; NULL, если активна",
    )

    members = relationship(
        User,
        secondary=group_members,
        backref="groups",
    )
