import json
import asyncio
import logging
from backend.config import settings
from backend.services.ai import call_openrouter, call_gemini
from backend.repositories.financials import get_financial_records, get_products
from backend.repositories.personnel import get_personnel
from backend.repositories.menu import get_menu
from backend.repositories.chat import insert_chat_message

logger = logging.getLogger(__name__)

async def process_chat_message(user_id: int, current_user: dict, message: str, conn) -> str:
    try:
        records = get_financial_records(user_id, conn)
        products = get_products(user_id, conn)
        personnel = get_personnel(user_id, conn)
        menu = get_menu(user_id, conn)
        
        if not settings.GEMINI_API_KEY and not settings.OPENROUTER_API_KEY:
            return "Since the AI API key is not installed, I am currently in simulated mode. I can analyze revenue and expenses for your business."
            
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
        
        history_rows = conn.execute(
            "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC LIMIT 30",
            (user_id,)
        ).fetchall()
        
        if settings.OPENROUTER_API_KEY:
            messages = [{"role": "system", "content": system_context}]
            for r in history_rows:
                role = "user" if r["role"] == "user" else "assistant"
                messages.append({"role": role, "content": r["content"]})
            messages.append({"role": "user", "content": message})
            
            reply = await asyncio.to_thread(call_openrouter, messages)
        else:
            contents = [{"role": "user", "parts": [system_context]}]
            for r in history_rows:
                role = "user" if r["role"] == "user" else "model"
                contents.append({"role": role, "parts": [r["content"]]})
                
            contents.append({"role": "user", "parts": [message]})
            
            reply = await asyncio.to_thread(call_gemini, contents)
            
        insert_chat_message(user_id, "user", message, conn)
        insert_chat_message(user_id, "model", reply, conn)
        conn.commit()
        return reply
    except Exception as e:
        logger.error("Error in process_chat_message: %s", e, exc_info=True)
        return "Sorry, an error occurred while processing your request. Please try again later."
