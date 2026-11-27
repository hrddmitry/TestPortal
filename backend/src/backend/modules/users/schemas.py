from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: str
    first_name: str
    last_name: str
    avatar: str | None = None
    birthday: date | None = None
    location: str | None = None
    phone: str | None = None
    about: str | None = None
    signature: str | None = None
    hired_at: date | None = None
    is_active: bool = True

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str | None
    last_name: str | None
    avatar: str | None
    birthday: date | None
    location: str | None
    phone: str | None
    about: str | None
    signature: str | None
    hired_at: date | None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None
    deleted_at: datetime | None

class SetPasswordRequest(BaseModel):
    password: str = Field(min_length=8)