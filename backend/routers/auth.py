from fastapi import APIRouter, HTTPException, Depends, Response
from backend.database import get_db_connection
from backend.schemas.auth import UserRegister, UserLogin
from backend.security import hash_password, verify_password, create_access_token, get_current_user
from backend.repositories.user import get_user_by_email, create_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register")
def register(user_in: UserRegister):
    conn = get_db_connection()
    existing = get_user_by_email(user_in.email, conn)
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Bu e-posta adresiyle zaten bir kullanıcı kayıtlı.")
    
    hashed = hash_password(user_in.password)
    try:
        create_user(user_in.email, hashed, user_in.business_name, user_in.business_type, conn)
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Kullanıcı kaydedilirken hata oluştu: {str(e)}")
    conn.close()
    return {"status": "success", "message": "Kullanıcı kaydı başarıyla oluşturuldu."}

@router.post("/login")
def login(user_in: UserLogin, response: Response):
    conn = get_db_connection()
    user = get_user_by_email(user_in.email, conn)
    conn.close()
    
    if not user or not verify_password(user_in.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-posta adresi veya şifre hatalı.")
    
    token = create_access_token({"sub": user["email"]})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax"
    )
    return {
        "status": "success",
        "user": {
            "email": user["email"],
            "business_name": user["business_name"],
            "business_type": user["business_type"]
        }
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"status": "success", "message": "Oturum başarıyla sonlandırıldı."}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "business_name": current_user["business_name"],
        "business_type": current_user["business_type"]
    }
