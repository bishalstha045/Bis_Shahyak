import jwt
import json
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from app.config import settings
from app.models.database import get_db_connection, hash_password, verify_password

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
    role: Optional[str] = "MSME Manufacturer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AssessmentSaveRequest(BaseModel):
    product_name: str
    standard_id: str
    standard_title: str
    readiness_score: int
    matrix: List[Dict[str, Any]]
    next_action: Optional[str] = None

def create_jwt_token(user_id: int, email: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload["sub"])
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name, company_name, role, created_at FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        if user:
            return dict(user)
    except Exception as e:
        pass
    return None

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token. Please log in.")
    return user

@router.post("/auth/register")
async def register(req: RegisterRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email.lower().strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")
    
    pwd_hash = hash_password(req.password)
    cursor.execute("""
    INSERT INTO users (email, password_hash, full_name, company_name, role)
    VALUES (?, ?, ?, ?, ?)
    """, (req.email.lower().strip(), pwd_hash, req.full_name, req.company_name, req.role))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    token = create_jwt_token(user_id, req.email.lower().strip(), req.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": req.email.lower().strip(),
            "full_name": req.full_name,
            "company_name": req.company_name,
            "role": req.role
        }
    }

@router.post("/auth/login")
async def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email.lower().strip(),))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email address or password.")
        
    token = create_jwt_token(user["id"], user["email"], user["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "company_name": user["company_name"],
            "role": user["role"],
            "created_at": user["created_at"]
        }
    }

@router.get("/auth/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return user

@router.get("/auth/assessments")
async def get_user_assessments(user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM compliance_assessments WHERE user_id = ? ORDER BY created_at DESC
    """, (user["id"],))
    rows = cursor.fetchall()
    conn.close()
    
    assessments = []
    for r in rows:
        assessments.append({
            "id": r["id"],
            "product_name": r["product_name"],
            "standard_id": r["standard_id"],
            "standard_title": r["standard_title"],
            "readiness_score": r["readiness_score"],
            "matrix": json.loads(r["matrix_json"]),
            "next_action": r["next_action"],
            "created_at": r["created_at"]
        })
    return assessments

@router.post("/auth/assessments")
async def save_user_assessment(req: AssessmentSaveRequest, user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO compliance_assessments (user_id, product_name, standard_id, standard_title, readiness_score, matrix_json, next_action)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user["id"],
        req.product_name,
        req.standard_id,
        req.standard_title,
        req.readiness_score,
        json.dumps(req.matrix),
        req.next_action
    ))
    assessment_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "status": "success",
        "assessment_id": assessment_id,
        "message": "Compliance assessment saved to your organization profile."
    }
