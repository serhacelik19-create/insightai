from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db_connection
from backend.security import get_current_user
from backend.schemas.personnel import PersonnelCreate
from backend.repositories.personnel import (
    get_personnel as repo_get_personnel,
    create_personnel as repo_create_personnel,
    get_personnel_by_id,
    delete_personnel as repo_delete_personnel,
    sync_personnel_expenses
)

router = APIRouter(prefix="/api/personnel", tags=["Personnel"])

@router.get("")
def get_personnel(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        personnel = repo_get_personnel(current_user["id"], conn)
        return personnel
    finally:
        conn.close()

@router.post("")
def create_personnel(personnel: PersonnelCreate, current_user: dict = Depends(get_current_user)):
    overtime_expense = personnel.overtime_hours * personnel.overtime_rate
    conn = get_db_connection()
    try:
        data = {
            "name": personnel.name,
            "surname": personnel.surname,
            "role": personnel.role,
            "monthly_salary": personnel.monthly_salary,
            "overtime_hours": personnel.overtime_hours,
            "overtime_rate": personnel.overtime_rate,
            "overtime_expense": overtime_expense
        }
        new_id = repo_create_personnel(current_user["id"], data, conn)
        sync_personnel_expenses(current_user["id"], conn)
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Personel eklenirken hata oluştu: {str(e)}")
    finally:
        conn.close()
        
    return {"status": "success", "id": new_id, "message": "Personel başarıyla eklendi.", "overtime_expense": overtime_expense}

@router.delete("/{personnel_id}")
def delete_personnel(personnel_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        personnel = get_personnel_by_id(current_user["id"], personnel_id, conn)
        if not personnel:
            raise HTTPException(status_code=404, detail="Personel bulunamadı veya silme yetkiniz yok.")
            
        repo_delete_personnel(current_user["id"], personnel_id, conn)
        sync_personnel_expenses(current_user["id"], conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Personel başarıyla silindi."}
