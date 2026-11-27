from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base


role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column(
        "role_id",
        Integer,
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Роль",
    ),
    Column(
        "permission_id",
        Integer,
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Право",
    ),
    comment="Права, назначенные ролям",
)

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column(
        "user_id",
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Пользователь",
    ),
    Column(
        "role_id",
        Integer,
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Роль",
    ),
    comment="Роли, назначенные пользователям",
)

user_permissions = Table(
    "user_permissions",
    Base.metadata,
    Column(
        "user_id",
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Пользователь",
    ),
    Column(
        "permission_id",
        Integer,
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Право",
    ),
    comment="Права, назначенные пользователям напрямую",
)


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"comment": "Роли пользователей"}

    id: Mapped[int] = mapped_column(
        primary_key=True,
        comment="Идентификатор роли",
    )
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        comment="Уникальное название роли",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        comment="Описание роли",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Когда создана роль",
    )

    permissions = relationship(
        "Permission",
        secondary=role_permissions,
        back_populates="roles",
    )
    users = relationship(
        "User",
        secondary=user_roles,
        back_populates="roles",
    )


class Permission(Base):
    __tablename__ = "permissions"
    __table_args__ = {"comment": "Права доступа"}

    id: Mapped[int] = mapped_column(
        primary_key=True,
        comment="Идентификатор права",
    )
    code: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        comment="Машинный код права, например users.manage",
    )
    name: Mapped[str] = mapped_column(
        String(255),
        comment="Человекочитаемое название права",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        comment="Описание права",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Когда создано право",
    )

    roles = relationship(
        "Role",
        secondary=role_permissions,
        back_populates="permissions",
    )
    users = relationship(
        "User",
        secondary=user_permissions,
        back_populates="permissions",
    )
