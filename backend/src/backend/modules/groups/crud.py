from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.modules.groups.models import Group, group_members
from backend.modules.groups.schemas import GroupCreate, GroupUpdate
from backend.modules.users.models import User


def get_group(db: Session, group_id: int) -> Group | None:
    return db.get(Group, group_id)


def get_group_by_name(db: Session, name: str) -> Group | None:
    return db.scalar(select(Group).where(Group.name == name))


def list_groups(db: Session) -> list[Group]:
    result = db.scalars(
        select(Group).where(Group.deleted_at.is_(None)).order_by(Group.name)
    )
    return list(result)


def create_group(db: Session, data: GroupCreate) -> Group:
    group = Group(
        name=data.name,
        description=data.description,
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


def update_group(db: Session, group: Group, data: GroupUpdate) -> Group:
    if data.name is not None:
        group.name = data.name
    if data.description is not None:
        group.description = data.description

    db.commit()
    db.refresh(group)
    return group


def soft_delete_group(db: Session, group: Group) -> Group:
    group.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(group)
    return group


def add_member(db: Session, group: Group, user: User) -> Group:
    if user not in group.members:
        group.members.append(user)
        db.commit()
        db.refresh(group)
    return group


def remove_member(db: Session, group: Group, user: User) -> Group:
    if user in group.members:
        group.members.remove(user)
        db.commit()
        db.refresh(group)
    return group


def list_group_members(db: Session, group_id: int) -> list[User]:
    result = db.scalars(
        select(User)
        .join(group_members, User.id == group_members.c.user_id)
        .where(group_members.c.group_id == group_id)
        .order_by(User.last_name, User.first_name, User.email)
    )
    return list(result)
