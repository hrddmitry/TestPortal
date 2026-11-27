from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.modules.roles.models import Permission, Role
from backend.modules.roles.schemas import PermissionCreate, RoleCreate


def create_role(db: Session, data: RoleCreate) -> Role:
    role = Role(name=data.name, description=data.description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def list_roles(db: Session) -> list[Role]:
    return list(db.execute(select(Role).order_by(Role.id)).scalars().all())


def get_role(db: Session, role_id: int) -> Role | None:
    return db.get(Role, role_id)


def create_permission(db: Session, data: PermissionCreate) -> Permission:
    permission = Permission(
        code=data.code,
        name=data.name,
        description=data.description,
    )
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


def list_permissions(db: Session) -> list[Permission]:
    return list(db.execute(select(Permission).order_by(Permission.id)).scalars().all())


def get_permission(db: Session, permission_id: int) -> Permission | None:
    return db.get(Permission, permission_id)
