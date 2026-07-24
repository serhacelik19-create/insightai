import json
import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db_connection
from backend.security import get_current_user
from backend.schemas.chat import ChatRequest
from backend.config import settings
from backend.services.ai import call_openrouter, call_gemini
from backend.services.analytics import generate_analysis_service, get_health_score_service
from backend.repositories.financials import get_financial_records, get_products
from backend.repositories.personnel import get_personnel
from backend.repositories.menu import get_menu
from backend.repositories.chat import get_chat_history, insert_chat_message, clear_chat_history

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
        records = get_financial_records(current_user["id"], conn)
        products = get_products(current_user["id"], conn)
        personnel = get_personnel(current_user["id"], conn)
        menu = get_menu(current_user["id"], conn)
        
        if not settings.GEMINI_API_KEY and not settings.OPENROUTER_API_KEY:
            return {
                "reply": "Since the AI API key is not installed, I am currently in simulated mode. I can analyze revenue and expenses for your business."
            }
            
        system_context = f"""
        You are the business owner's personal AI financial consultant. Your name is 'InsightAI'.
        Business type: {current_user["business_type"]}.
        Business name: {current_user["business_name"]}.
        Business financial data: {json.dumps(records, ensure_ascii=False)}
        Business product data: {json.dumps(products, ensure_ascii=False)}
        Team/Personnel data: {json.dumps(personnel, ensure_ascii=False)}
        Restaurant menu data: {json.dumps(menu, ensure_ascii=False)}
        
        Speak professionally, constructively, motivatingly, and in English. Give clear answers based on financial data.
        If they ask for something not in the data, request additional information or speak based on data rather than making assumptions.
        """
        
        # Get history from the chat_history table
        history_rows = conn.execute(
            "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC LIMIT 30",
            (current_user["id"],)
        ).fetchall()
        
        if settings.OPENROUTER_API_KEY:
            messages = [{"role": "system", "content": system_context}]
            for r in history_rows:
                role = "user" if r["role"] == "user" else "assistant"
                messages.append({"role": role, "content": r["content"]})
            messages.append({"role": "user", "content": request.message})
            
            reply = await asyncio.to_thread(call_openrouter, messages)
        else:
            contents = [{"role": "user", "parts": [system_context]}]
            for r in history_rows:
                role = "user" if r["role"] == "user" else "model"
                contents.append({"role": role, "parts": [r["content"]]})
                
            contents.append({"role": "user", "parts": [request.message]})
            
            reply = await asyncio.to_thread(call_gemini, contents)
            
        insert_chat_message(current_user["id"], "user", request.message, conn)
        insert_chat_message(current_user["id"], "model", reply, conn)
        conn.commit()
        return {"reply": reply}
    except Exception as e:
        logger.error("Error in chat_with_ai endpoint: %s", e, exc_info=True)
        return {"reply": "Sorry, an error occurred while processing your request. Please try again later."}
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
