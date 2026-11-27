from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUser(BaseModel):
    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ProfileRead(BaseModel):
    id: int
    email: str
    first_name: str | None
    last_name: str | None
    avatar: str | None
    birthday: date | None
    location: str | None
    phone: str | None
    about: str | None
    hired_at: date | None
    is_active: bool
    roles: list[str]
    permissions: list[str]
    permission_names: list[str]
    groups: list[str]


class ProfileUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    avatar: str | None = Field(default=None, max_length=500)
    birthday: date | None = None
    location: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    about: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
