from fastapi import APIRouter, HTTPException, Depends
from api.models import LoginRequest
from api.db import fetch_one
from api.auth import verify_password, create_token, require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(payload: LoginRequest):
    admin = fetch_one("SELECT * FROM admins WHERE email = %s", (payload.email.lower().strip(),))
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(str(admin["id"]), admin["email"])
    return {
        "token": token,
        "admin": {"id": admin["id"], "name": admin["name"], "email": admin["email"]},
    }


@router.get("/me")
def me(current=Depends(require_admin)):
    admin = fetch_one("SELECT id, name, email, created_at FROM admins WHERE id = %s", (current["sub"],))
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin
