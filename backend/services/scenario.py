import json
from fastapi import HTTPException
from backend.config import settings
from backend.services.ai import call_openrouter, call_gemini

def run_scenario_analysis_service(stype: str, params: dict, records: list, products: list, business_type: str) -> dict:
    if not records:
        raise HTTPException(status_code=400, detail="Financial records must exist to run scenario analysis.")
        
    current_revenue = sum(r["revenue"] for r in records)
    current_expenses = sum(r["expenses"] for r in records)
    current_profit = current_revenue - current_expenses
    current_margin = (current_profit / current_revenue * 100) if current_revenue > 0 else 0
    
    projected_revenue = current_revenue
    projected_expenses = current_expenses
    
    if stype == "expense_reduction":
        category = params.get("category") or "other"
        reduction_percent = 0.0
        try:
            reduction_percent = float(params.get("reduction_percent") or params.get("percent") or params.get("value") or 0)
        except (ValueError, TypeError):
            pass
        
        col_name = f"{category}_expense" if category in ["rent", "personnel", "marketing", "material", "other"] else "other_expense"
        category_sum = sum(r.get(col_name, 0) for r in records)
        reduction_amount = category_sum * (reduction_percent / 100)
        projected_expenses = max(0.0, current_expenses - reduction_amount)
        
    elif stype == "revenue_increase":
        increase_percent = 0.0
        try:
            increase_percent = float(params.get("increase_percent") or params.get("percent") or params.get("value") or 0)
        except (ValueError, TypeError):
            pass
        projected_revenue = current_revenue * (1 + increase_percent / 100)
        
    elif stype == "price_change":
        price_change_percent = 0.0
        try:
            price_change_percent = float(params.get("price_change_percent") or params.get("percent") or params.get("value") or 0)
        except (ValueError, TypeError):
            pass
        product_name = str(params.get("product_name") or params.get("product") or "")
        
        matched_products = [p for p in products if p["name"].lower() == product_name.lower()]
        pct = price_change_percent / 100
        demand_drop = pct * 0.3
        
        if not matched_products:
            projected_revenue = current_revenue * (1 + pct) * (1 - demand_drop)
            latest_rec = records[-1] if records else {}
            latest_mat = latest_rec.get("material_expense", 0) or 0
            latest_exp = latest_rec.get("expenses", 1) or 1
            mat_ratio = (latest_mat / latest_exp) if latest_exp > 0 else 0.35
            if mat_ratio == 0:
                mat_ratio = 0.35
            
            total_material_expense = sum(r.get("material_expense", 0) for r in records) or (current_expenses * mat_ratio)
            projected_expenses = current_expenses - (total_material_expense * demand_drop)
        else:
            prod_rev_sum = sum(p["revenue"] for p in matched_products)
            prod_cost_sum = 0.0
            for p in matched_products:
                cpu = p.get("cost_per_unit", 0) or 0.0
                if cpu == 0.0 and p["revenue"] > 0 and p["units"] > 0:
                    cpu = round((p["revenue"] / p["units"]) * 0.4, 2)
                prod_cost_sum += p["units"] * cpu
                
            new_prod_rev = prod_rev_sum * (1 + pct) * (1 - demand_drop)
            projected_revenue = current_revenue + (new_prod_rev - prod_rev_sum)
            projected_expenses = current_expenses - (prod_cost_sum * demand_drop)
            
    elif stype == "product_removal":
        product_name = str(params.get("product_name") or params.get("product") or params.get("value") or "")
        
        matched_products = [p for p in products if p["name"].lower() == product_name.lower()]
        if not matched_products:
            raise HTTPException(status_code=400, detail=f"Product named '{product_name}' not found.")
            
        prod_rev_sum = sum(p["revenue"] for p in matched_products)
        prod_cost_sum = 0.0
        for p in matched_products:
            cpu = p.get("cost_per_unit", 0) or 0.0
            if cpu == 0.0 and p["revenue"] > 0 and p["units"] > 0:
                cpu = round((p["revenue"] / p["units"]) * 0.4, 2)
            prod_cost_sum += p["units"] * cpu
        
        projected_revenue = max(0.0, current_revenue - prod_rev_sum)
        projected_expenses = max(0.0, current_expenses - prod_cost_sum)
        
    else:
        raise HTTPException(status_code=400, detail="Invalid scenario type.")
        
    projected_profit = projected_revenue - projected_expenses
    projected_margin = (projected_profit / projected_revenue * 100) if projected_revenue > 0 else 0
    
    profit_change = projected_profit - current_profit
    margin_change = projected_margin - current_margin
    
    if not settings.GEMINI_API_KEY and not settings.OPENROUTER_API_KEY:
        raise ValueError("API key not configured. AI commentary requires GEMINI_API_KEY or OPENROUTER_API_KEY.")
        
    ai_commentary = ""
    try:
        prompt = f"""
        You are a financial expert consultant. A scenario analysis has been performed for a business.
        Business Type: {business_type}
        Scenario Type: {stype}
        Parameters: {json.dumps(params, ensure_ascii=False)}
        
        Current Situation: Revenue={current_revenue:.2f}, Expenses={current_expenses:.2f}, Profit={current_profit:.2f}, Margin={current_margin:.1f}%
        Projected Situation: Revenue={projected_revenue:.2f}, Expenses={projected_expenses:.2f}, Profit={projected_profit:.2f}, Margin={projected_margin:.1f}%
        Impact: Profit Change={profit_change:.2f}, Margin Change={margin_change:.1f}%
        
        Write a constructive analysis of maximum 2 sentences in English, interpreting the impact of this scenario on the business.
        """
        if settings.OPENROUTER_API_KEY:
            messages = [{"role": "user", "content": prompt}]
            ai_commentary = call_openrouter(messages)
        else:
            ai_commentary = call_gemini([prompt])
    except Exception as e:
        print("AI Scenario Commentary Error:", str(e))
        raise e
            
    response_data = {
        "scenario_type": stype,
        "current": {
            "total_revenue": round(current_revenue, 2),
            "total_expenses": round(current_expenses, 2),
            "total_profit": round(current_profit, 2),
            "profit_margin": round(current_margin, 2)
        },
        "projected": {
            "total_revenue": round(projected_revenue, 2),
            "total_expenses": round(projected_expenses, 2),
            "total_profit": round(projected_profit, 2),
            "profit_margin": round(projected_margin, 2)
        },
        "impact": {
            "profit_change": round(profit_change, 2),
            "margin_change": round(margin_change, 2)
        },
        "ai_commentary": ai_commentary
    }
    
    return response_data
