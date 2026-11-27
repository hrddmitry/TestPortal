from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.modules.auth.permissions import require_permission
from backend.modules.roles import crud
from backend.modules.roles.models import Permission, Role
from backend.modules.users.models import User
from backend.modules.roles.schemas import (
    PermissionCreate,
    PermissionRead,
    RoleCreate,
    RoleRead,
)

router = APIRouter(prefix="/api", tags=["roles"])


@router.post("/roles", response_model=RoleRead, status_code=201)
def create_role(
    data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("roles.manage")),
) -> Role:
    return crud.create_role(db, data)


@router.get("/roles", response_model=list[RoleRead])
def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("roles.manage")),
) -> list[Role]:
    return crud.list_roles(db)


@router.post("/permissions", response_model=PermissionRead, status_code=201)
def create_permission(
    data: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("permissions.manage")),
) -> Permission:
    return crud.create_permission(db, data)


@router.get("/permissions", response_model=list[PermissionRead])
def list_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("permissions.manage")),
) -> list[Permission]:
    return crud.list_permissions(db)


@router.post("/roles/{role_id}/permissions/{permission_id}", response_model=RoleRead)
def add_permission_to_role(
    role_id: int,
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("roles.manage")),
) -> Role:
    role = crud.get_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    permission = crud.get_permission(db, permission_id)
    if permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")

    if permission not in role.permissions:
        role.permissions.append(permission)
        db.commit()
        db.refresh(role)

    return role


@router.post("/users/{user_id}/roles/{role_id}", response_model=RoleRead)
def assign_role_to_user(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("roles.manage")),
) -> Role:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    role = crud.get_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    if role not in user.roles:
        user.roles.append(role)
        db.commit()
        db.refresh(role)

    return role


@router.post("/users/{user_id}/permissions/{permission_id}", response_model=PermissionRead)
def assign_permission_to_user(
    user_id: int,
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("permissions.manage")),
) -> Permission:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    permission = crud.get_permission(db, permission_id)
    if permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")

    if permission not in user.permissions:
        user.permissions.append(permission)
        db.commit()
        db.refresh(permission)

    return permission
