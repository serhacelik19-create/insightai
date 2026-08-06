import json
import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db_connection
from backend.security import get_current_user
from backend.schemas.chat import ChatRequest
from backend.config import settings
from backend.services.analytics import generate_analysis_service, get_health_score_service
from backend.services.chat import process_chat_message
from backend.repositories.financials import get_financial_records, get_products
from backend.repositories.chat import get_chat_history, clear_chat_history

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics"])

BENCHMARK_DATA = {
    "restaurant": {"avg_profit_margin": 12.0, "avg_food_cost": 32.0, "avg_labor_cost": 30.0, "avg_rent_ratio": 10.0, "industry_name": "Restaurant & Cafe"},
    "ecommerce": {"avg_profit_margin": 18.0, "avg_cac": 45.0, "avg_return_rate": 5.0, "avg_aov": 280.0, "industry_name": "E-Commerce"},
    "b2b": {"avg_profit_margin": 25.0, "avg_churn_rate": 3.5, "avg_ltv_cac_ratio": 12.0, "avg_expansion_mrr": 8.0, "industry_name": "B2B SaaS"},
    "general": {"avg_profit_margin": 15.0, "avg_expense_ratio": 70.0, "avg_growth_rate": 5.0, "industry_name": "General Retail"}
}

@router.post("/api/analyze")
def generate_analysis(force: bool = False, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        result = generate_analysis_service(current_user, force, conn)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    finally:
        conn.close()

@router.get("/api/chat/history")
def get_chat_history_endpoint(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        history = get_chat_history(current_user["id"], conn)
        return history
    finally:
        conn.close()

@router.post("/api/chat")
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        reply = await process_chat_message(current_user["id"], current_user, request.message, conn)
        return {"reply": reply}
    finally:
        conn.close()

@router.get("/api/health")
def get_health_score(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        records = get_financial_records(current_user["id"], conn)
        products = get_products(current_user["id"], conn)
    finally:
        conn.close()
    return get_health_score_service(records, products)

@router.get("/api/benchmark/{business_type}")
def get_sector_benchmark(business_type: str, current_user: dict = Depends(get_current_user)):
    data = BENCHMARK_DATA.get(business_type.lower())
    if not data:
        data = BENCHMARK_DATA["general"]
    return data

@router.post("/api/chat/clear")
def clear_chat_history_endpoint(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        clear_chat_history(current_user["id"], conn)
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")
    finally:
        conn.close()
    return {"status": "success", "message": "Your chat history has been cleared successfully."}
