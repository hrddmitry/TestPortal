from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.core.database import get_db

app = FastAPI(title="TestPortal API")

DbSession = Annotated[Session, Depends(get_db)]


@app.get("/api/health")
def health(db: DbSession) -> dict[str, str]:
    try:
        db.execute(text("select 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return {"status": "ok", "database": "ok"}

from backend.modules.auth.router import router as auth_router
from backend.modules.roles.router import router as roles_router
from backend.modules.users.router import router as users_router
app.include_router(auth_router)
app.include_router(roles_router)
app.include_router(users_router)

