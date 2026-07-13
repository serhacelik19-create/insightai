from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db_connection
from backend.security import get_current_user
from backend.schemas.menu import MenuCreate
from backend.repositories.menu import (
    get_menu as repo_get_menu,
    create_menu_item as repo_create_menu_item,
    get_menu_item_by_id,
    delete_menu_item as repo_delete_menu_item
)

router = APIRouter(prefix="/api/menu", tags=["Menu"])

@router.get("")
def get_menu(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        menu = repo_get_menu(current_user["id"], conn)
        return menu
    finally:
        conn.close()

@router.post("")
def create_menu_item(menu: MenuCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        data = {
            "item_name": menu.item_name,
            "category": menu.category,
            "sale_price": menu.sale_price,
            "portion_cost": menu.portion_cost
        }
        new_id = repo_create_menu_item(current_user["id"], data, conn)
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Menü öğesi eklenirken hata oluştu: {str(e)}")
    finally:
        conn.close()
    return {"status": "success", "id": new_id, "message": "Menü öğesi başarıyla eklendi."}

@router.delete("/{menu_id}")
def delete_menu_item(menu_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        menu_item = get_menu_item_by_id(current_user["id"], menu_id, conn)
        if not menu_item:
            raise HTTPException(status_code=404, detail="Menü öğesi bulunamadı veya silme yetkiniz yok.")
            
        repo_delete_menu_item(current_user["id"], menu_id, conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Menü öğesi başarıyla silindi."}
