from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db_connection
from backend.security import get_current_user, hash_password
from backend.schemas.auth import BusinessProfileUpdate, CredentialsUpdate
from backend.repositories.user import update_profile, update_credentials, get_user_by_email

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "business_name": current_user["business_name"],
        "business_type": current_user["business_type"],
        "email": current_user["email"]
    }

@router.post("")
def update_profile_endpoint(profile: BusinessProfileUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        update_profile(current_user["id"], profile.business_name, profile.business_type, conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "profile": profile}

@router.post("/credentials")
def update_credentials_endpoint(creds: CredentialsUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        if creds.email and creds.email != current_user["email"]:
            existing = get_user_by_email(creds.email, conn)
            if existing:
                raise HTTPException(status_code=400, detail="This email is already in use.")
        
        password_hash = None
        if creds.password:
            password_hash = hash_password(creds.password)
            
        update_credentials(current_user["id"], creds.email, password_hash, conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Credentials updated successfully."}
