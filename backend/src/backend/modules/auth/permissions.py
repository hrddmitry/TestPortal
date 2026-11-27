from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.modules.auth.dependencies import get_current_user_id
from backend.modules.roles.models import Permission, Role, role_permissions, user_permissions, user_roles
from backend.modules.users.models import User


def require_permission(permission_code: str):
    def checker(
        current_user_id: int = Depends(get_current_user_id),
        db: Session = Depends(get_db),
    ) -> User:
        user = db.get(User, current_user_id)

        if user is None or not user.is_active or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive or not found",
            )

        direct_permission = db.execute(
            select(Permission)
            .join(user_permissions, Permission.id == user_permissions.c.permission_id)
            .where(
                user_permissions.c.user_id == current_user_id,
                Permission.code == permission_code,
            )
        ).scalar_one_or_none()

        role_permission = db.execute(
            select(Permission)
            .join(
                role_permissions,
                Permission.id == role_permissions.c.permission_id,
            )
            .join(
                user_roles,
                role_permissions.c.role_id == user_roles.c.role_id,
            )
            .where(
                user_roles.c.user_id == current_user_id,
                Permission.code == permission_code,
            )
        ).scalar_one_or_none()

        if direct_permission is None and role_permission is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied",
            )

        return user

    return checker
