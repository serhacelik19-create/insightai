from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    business_name: Optional[str] = "My Business"
    business_type: Optional[str] = "general"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class BusinessProfileUpdate(BaseModel):
    business_name: str
    business_type: str

class CredentialsUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
