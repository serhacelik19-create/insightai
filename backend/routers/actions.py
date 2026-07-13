from fastapi import APIRouter, Depends
from backend.database import get_db_connection
from backend.security import get_current_user
from backend.schemas.financials import ActionCreate, ActionUpdate
from backend.repositories.actions import (
    get_actions as repo_get_actions,
    create_action as repo_create_action,
    update_action_status
)

router = APIRouter(prefix="/api/actions", tags=["Action Plan"])

@router.get("")
def get_actions(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        actions = repo_get_actions(current_user["id"], conn)
        return actions
    finally:
        conn.close()

@router.post("")
def create_action(action: ActionCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        data = {
            "title": action.title,
            "impact": action.impact,
            "financial_impact_value": action.financial_impact_value
        }
        new_id = repo_create_action(current_user["id"], data, conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "id": new_id, "message": "Aksiyon başarıyla oluşturuldu."}

@router.put("/{action_id}")
def update_action(action_id: int, action: ActionUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        update_action_status(current_user["id"], action_id, action.status, conn)
        conn.commit()
    finally:
        conn.close()
    return {"status": "success", "message": "Aksiyon güncellendi."}
