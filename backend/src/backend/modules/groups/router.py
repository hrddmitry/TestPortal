from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.modules.auth.permissions import require_permission
from backend.modules.groups import crud, schemas
from backend.modules.groups.models import Group
from backend.modules.users.models import User


router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.get("", response_model=list[schemas.GroupRead])
def list_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> list[Group]:
    return crud.list_groups(db)


@router.post("", response_model=schemas.GroupRead, status_code=status.HTTP_201_CREATED)
def create_group(
    data: schemas.GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> Group:
    if crud.get_group_by_name(db, data.name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Group with this name already exists",
        )
    return crud.create_group(db, data)


@router.get("/{group_id}", response_model=schemas.GroupRead)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> Group:
    group = crud.get_group(db, group_id)
    if group is None or group.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )
    return group


@router.patch("/{group_id}", response_model=schemas.GroupRead)
def update_group(
    group_id: int,
    data: schemas.GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> Group:
    group = crud.get_group(db, group_id)
    if group is None or group.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    if data.name is not None:
        existing = crud.get_group_by_name(db, data.name)
        if existing and existing.id != group.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Group with this name already exists",
            )

    return crud.update_group(db, group, data)


@router.delete("/{group_id}", response_model=schemas.GroupRead)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> Group:
    group = crud.get_group(db, group_id)
    if group is None or group.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )
    return crud.soft_delete_group(db, group)


@router.get("/{group_id}/members", response_model=list[dict])
def list_group_members(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> list[dict]:
    group = crud.get_group(db, group_id)
    if group is None or group.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )
    return [
        {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        for user in crud.list_group_members(db, group_id)
    ]


@router.post("/{group_id}/members/{user_id}", response_model=list[dict])
def add_group_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> list[dict]:
    group = crud.get_group(db, group_id)
    user = db.get(User, user_id)

    if group is None or group.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    crud.add_member(db, group, user)
    return [
        {
            "id": member.id,
            "email": member.email,
            "first_name": member.first_name,
            "last_name": member.last_name,
        }
        for member in crud.list_group_members(db, group_id)
    ]


@router.delete("/{group_id}/members/{user_id}", response_model=list[dict])
def remove_group_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("groups.manage")),
) -> list[dict]:
    group = crud.get_group(db, group_id)
    user = db.get(User, user_id)

    if group is None or group.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    crud.remove_member(db, group, user)
    return [
        {
            "id": member.id,
            "email": member.email,
            "first_name": member.first_name,
            "last_name": member.last_name,
        }
        for member in crud.list_group_members(db, group_id)
    ]
