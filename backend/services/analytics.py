import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.config import settings
from backend.database import get_db_connection
from backend.services.ai import call_openrouter, call_gemini
from backend.repositories.analytics import get_cached_analysis, save_analysis_to_cache

def detect_anomalies(records: list, products: list, user_id: int, conn=None) -> list:
    insights = []
    
    close_conn = False
    if conn is None:
        conn = get_db_connection()
        close_conn = True
        
    try:
        personnel_rows = [dict(p) for p in conn.execute(
            "SELECT name, surname, role, overtime_hours, overtime_expense FROM personnel WHERE user_id = ? AND overtime_hours > 0",
            (user_id,)
        ).fetchall()]
        for p in personnel_rows:
            insights.append({
                "type": "warning",
                "title": "Personnel Overtime Warning",
                "description": f"Personnel {p['name']} {p['surname']} ({p['role']}) has worked {p['overtime_hours']} hours overtime this month. Overtime cost: {p['overtime_expense']}.",
                "basis": "personnel_overtime"
            })
    except Exception as e:
        print("Personnel anomaly check error:", str(e))
        
    try:
        menu_rows = [dict(m) for m in conn.execute(
            "SELECT item_name, sale_price, portion_cost FROM restaurant_menu WHERE user_id = ?",
            (user_id,)
        ).fetchall()]
        for m in menu_rows:
            sale = m['sale_price']
            cost = m['portion_cost']
            if sale > 0:
                ratio = (cost / sale) * 100
                if ratio > 35:
                    insights.append({
                        "type": "warning",
                        "title": "Critical Portion Cost",
                        "description": f"The cost ratio of the item '{m['item_name']}' is {ratio:.1f}%, exceeding the ideal limit of 30%.",
                        "basis": "menu_food_cost"
                    })
    except Exception as e:
        print("Menu anomaly check error:", str(e))
        
    if close_conn:
        conn.close()
    
    # Sorting by date
    try:
        sorted_records = sorted(records, key=lambda x: x.get("date", ""))
    except Exception:
        sorted_records = records

    if len(sorted_records) >= 2:
        recent = sorted_records[-1]
        previous = sorted_records[-2]
        
        # 1. General Increase in Expenses
        if previous.get("expenses", 0) > 0:
            exp_change = ((recent["expenses"] - previous["expenses"]) / previous["expenses"]) * 100
            if exp_change > 15:
                diff = recent["expenses"] - previous["expenses"]
                insights.append({
                    "title": "Abnormal Increase in Expenses",
                    "description": f"A significant increase of {exp_change:.1f}% was detected in your expenses compared to the previous period.",
                    "type": "warning",
                    "impact": f"-{diff:,.2f} impact",
                    "difficulty": "Medium",
                    "timeframe": "This month",
                    "confidence": 90,
                    "basis": "Comparison of the last 2 periods of expenses"
                })
        
        # 2. Decrease / Improvement in Profit Margin
        if recent.get("revenue", 0) > 0 and previous.get("revenue", 0) > 0:
            recent_margin = (recent["profit"] / recent["revenue"]) * 100
            prev_margin = (previous["profit"] / previous["revenue"]) * 100
            if recent_margin < prev_margin - 5:
                diff_margin = prev_margin - recent_margin
                impact_val = (recent["revenue"] * diff_margin) / 100
                insights.append({
                    "title": "Decrease in Profit Margin",
                    "description": f"Your profit margin decreased by {diff_margin:.1f} percentage points compared to the previous period.",
                    "type": "warning",
                    "impact": f"-{impact_val:,.2f} profit loss",
                    "difficulty": "Hard",
                    "timeframe": "This month",
                    "confidence": 85,
                    "basis": "Comparison of the last 2 periods of profit margin"
                })
            elif recent_margin > prev_margin + 5:
                diff_margin = recent_margin - prev_margin
                impact_val = (recent["revenue"] * diff_margin) / 100
                insights.append({
                    "title": "Improvement in Profit Margin",
                    "description": f"Your profit margin increased by {diff_margin:.1f} percentage points compared to the previous period. Great performance!",
                    "type": "success",
                    "impact": f"+{impact_val:,.2f} additional profit",
                    "difficulty": "Easy",
                    "timeframe": "This week",
                    "confidence": 85,
                    "basis": "Comparison of the last 2 periods of profit margin"
                })

    # 3. 3+ Period Trend Analysis
    if len(sorted_records) >= 3:
        if (sorted_records[-1].get("expenses", 0) > sorted_records[-2].get("expenses", 0) > sorted_records[-3].get("expenses", 0)):
            diff_total = sorted_records[-1]["expenses"] - sorted_records[-3]["expenses"]
            insights.append({
                "title": "Continuously Increasing Expense Trend",
                "description": "Your expenses have been continuously increasing for the last 3 consecutive periods. Controlling costs is critical.",
                "type": "warning",
                "impact": f"-{diff_total:,.2f} total increase",
                "difficulty": "Medium",
                "timeframe": "This month",
                "confidence": 92,
                "basis": "Last 3 periods expense trend"
            })

    # 4. Gider Kalemi Anomalisi
    if len(sorted_records) >= 2:
        recent = sorted_records[-1]
        previous = sorted_records[-2]
        categories = [
            ("marketing_expense", "Marketing"),
            ("rent_expense", "Rent"),
            ("personnel_expense", "Personnel"),
            ("material_expense", "Material/Product"),
            ("other_expense", "Other")
        ]
        for cat_key, cat_name in categories:
            rec_val = recent.get(cat_key, 0)
            prev_val = previous.get(cat_key, 0)
            if prev_val > 0:
                change_pct = ((rec_val - prev_val) / prev_val) * 100
                if change_pct > 25:
                    diff = rec_val - prev_val
                    insights.append({
                        "title": f"High {cat_name} Expense Increase",
                        "description": f"Your {cat_name} expenses showed an abnormal increase of {change_pct:.1f}% compared to the previous period.",
                        "type": "warning",
                        "impact": f"-{diff:,.2f} impact",
                        "difficulty": "Easy",
                        "timeframe": "This week",
                        "confidence": 88,
                        "basis": f"Comparison of the last 2 periods of {cat_name}"
                    })

    # 5. Product Performance Anomaly
    if products:
        total_units = sum(p.get("units", 0) for p in products)
        for prod in products:
            rev = prod.get("revenue", 0)
            units = prod.get("units", 0)
            
            cost_per_unit = prod.get("cost_per_unit", 0) or 0.0
            if cost_per_unit == 0.0 and rev > 0 and units > 0:
                cost_per_unit = round((rev / units) * 0.4, 2)
                
            cost_val = units * cost_per_unit
            prod_profit = rev - cost_val
            prod_margin = (prod_profit / rev * 100) if rev > 0 else 0
            
            if total_units > 0 and (units / total_units) >= 0.30 and prod_margin < 10:
                insights.append({
                    "title": "High Volume Low Margin Product",
                    "description": f"Although your product '{prod['name']}' constitutes {(units/total_units)*100:.1f}% of the total sales volume, its profit margin is quite low ({prod_margin:.1f}%). Pricing or supply costs should be reviewed.",
                    "type": "warning",
                    "impact": "Loss of profitability potential",
                    "difficulty": "Medium",
                    "timeframe": "This month",
                    "confidence": 85,
                    "basis": f"Product sales volume ({(units/total_units)*100:.0f}%) and margin ({prod_margin:.1f}%)"
                })

    if products and not insights:
        sorted_prods = sorted(products, key=lambda x: x.get("revenue", 0), reverse=True)
        if len(sorted_prods) >= 3:
            top_prod = sorted_prods[0]
            bottom_prod = sorted_prods[-1]
            if top_prod["revenue"] > bottom_prod["revenue"] * 3 and bottom_prod["revenue"] > 0:
                diff = top_prod["revenue"] - bottom_prod["revenue"]
                insights.append({
                    "title": "Product Revenue Distribution Imbalance",
                    "description": f"While your product '{top_prod['name']}' generates high revenue, '{bottom_prod['name']}' performance is low. Profit can be increased with optimization.",
                    "type": "info",
                    "impact": f"+{diff*0.1:,.2f} potential (Estimated)",
                    "difficulty": "Medium",
                    "timeframe": "This month",
                    "confidence": 80,
                    "basis": "Product revenue distribution"
                })

    return insights

def generate_analysis_service(current_user: dict, force: bool, conn) -> dict:
    records = [dict(r) for r in conn.execute(
        "SELECT date, revenue, expenses, profit, rent_expense, personnel_expense, marketing_expense, material_expense, other_expense FROM financial_records WHERE user_id = ?",
        (current_user["id"],)
    ).fetchall()]
    
    products = [dict(p) for p in conn.execute(
        "SELECT name, revenue, units, cost_per_unit FROM products WHERE user_id = ?",
        (current_user["id"],)
    ).fetchall()]
    
    personnel = [dict(p) for p in conn.execute(
        "SELECT name, surname, role, monthly_salary, overtime_hours, overtime_rate, overtime_expense FROM personnel WHERE user_id = ?",
        (current_user["id"],)
    ).fetchall()]
    
    menu = [dict(m) for m in conn.execute(
        "SELECT item_name, category, sale_price, portion_cost FROM restaurant_menu WHERE user_id = ?",
        (current_user["id"],)
    ).fetchall()]
    
    if not records and not products and not personnel and not menu:
        return {"error": "No data found"}
        
    if not force:
        cache = get_cached_analysis(current_user["id"], conn)
        if cache:
            try:
                created_at_dt = datetime.strptime(cache["created_at"], "%Y-%m-%d %H:%M:%S")
                if datetime.utcnow() - created_at_dt < timedelta(days=7):
                    return {
                        "summary": cache["summary"],
                        "insights": json.loads(cache["insights"])
                    }
            except Exception as ex:
                print("Cache date parsing error, recalculating:", str(ex))
                
    if not settings.GEMINI_API_KEY and not settings.OPENROUTER_API_KEY:
        raise ValueError("API key not configured. AI Analysis requires GEMINI_API_KEY or OPENROUTER_API_KEY.")
        
    try:
        prompt = f"""
        You are a professional business analytics and financial consultant.
        Below is the data of a business. Analyze this data and generate insights and recommendations for the business owner in English.
        
        Business Type: {current_user["business_type"]}
        Business Name: {current_user["business_name"]}
        
        Financial Records (Recent Months):
        {json.dumps(records, ensure_ascii=False, indent=2)}
        
        Product/Service Breakdown:
        {json.dumps(products, ensure_ascii=False, indent=2)}
        
        Team Personnel Information:
        {json.dumps(personnel, ensure_ascii=False, indent=2)}
        
        Restaurant Menu Items:
        {json.dumps(menu, ensure_ascii=False, indent=2)}
        
        Detected Mathematical Anomalies:
        {json.dumps(detect_anomalies(records, products, current_user["id"], conn), ensure_ascii=False, indent=2)}
        
        Expectations from you:
        1. Write a brief and clear evaluation of the overall financial situation (Maximum 3 sentences).
        2. Create 3 critical and actionable recommendation cards for the business owner. The recommendations should be suitable for the industry ({current_user["business_type"]}).
        When generating recommendation cards, you can produce name-based recommendations (for example, by specifying the name of the employee or the name of the dish) taking into account the overtime of these employees or the portion cost / sale price ratios in the menu.
        
        Strictly return the response in the following JSON format and do not add any other explanation text. JSON format:
        {{
            "summary": "Overall financial situation evaluation...",
            "insights": [
                {{
                    "title": "Recommendation Title 1",
                    "description": "Recommendation details and actions to be taken...",
                    "type": "warning", // one of warning, info, success
                    "impact": "-$24,000 projected risk", // or "+$15,000 estimated profit", specify a clear financial impact
                    "difficulty": "Medium", // Easy, Medium, or Hard
                    "timeframe": "This month", // Today, This week, or This month
                    "confidence": 85, // a number between 0 and 100
                    "basis": "Increase in expenses in the last 2 periods" // the data point the recommendation is based on
                }},
                {{
                    "title": "Recommendation Title 2",
                    "description": "Recommendation details...",
                    "type": "success",
                    "impact": "+$15,000 estimated profit",
                    "difficulty": "Easy",
                    "timeframe": "This week",
                    "confidence": 92,
                    "basis": "High profit margin product sales trend"
                }}
            ]
        }}
        """
        
        if settings.OPENROUTER_API_KEY:
            messages = [{"role": "user", "content": prompt}]
            text = call_openrouter(messages)
        else:
            text = call_gemini([prompt])
            
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        analysis_result = json.loads(text)
        
        try:
            save_analysis_to_cache(current_user["id"], analysis_result["summary"], analysis_result["insights"], conn)
        except Exception as cache_ex:
            print("Failed to save analysis to cache:", str(cache_ex))
            
        return analysis_result
        
    except Exception as e:
        print("AI Analysis Error:", str(e))
        raise e

def get_health_score_service(records: list, products: list) -> dict:
    try:
        records = sorted(records, key=lambda x: x.get("date", ""))
    except Exception:
        pass
        
    if not records:
        return {
            "cash_flow_score": 0,
            "cash_flow_status": "No Data",
            "cash_flow_comment": "No financial data found for health score analysis.",
            "radar_metrics": []
        }
        
    latest_month = records[-1]
    prev_month = records[-2] if len(records) > 1 else None
    
    # 1. Profitability
    latest_rev = latest_month.get("revenue", 0)
    latest_profit = latest_month.get("profit", 0)
    margin_ratio = (latest_profit / latest_rev) if latest_rev > 0 else 0
    profitability = round(min(100, max(20, (margin_ratio / 0.30) * 100)))
    
    # 2. Growth
    growth = 50
    if prev_month and prev_month.get("revenue", 0) > 0:
        prev_rev = prev_month.get("revenue", 0)
        rev_change = (latest_rev - prev_rev) / prev_rev
        growth = round(min(100, max(20, 50 + (rev_change * 250))))
        
    # 3. Cost Control
    latest_expenses = latest_month.get("expenses", 0)
    expense_ratio = (latest_expenses / latest_rev) if latest_rev > 0 else 1
    cost_control = round(min(100, max(20, 100 - ((expense_ratio - 0.5) * 200))))
    
    # 4. Product Diversity
    prod_count = len(products) if products else 0
    product_diversity = 100 if prod_count >= 4 else 85 if prod_count == 3 else 65 if prod_count == 2 else 40 if prod_count == 1 else 20
    
    # 5. Stability
    profitable_months = len([r for r in records if r.get("profit", 0) >= 0])
    stability = round((profitable_months / len(records)) * 100) if records else 0
    
    # Overall Score
    overall_score = round((profitability + growth + cost_control + product_diversity + stability) / 5)
    
    status_text = 'Excellent'
    desc_text = 'The financial structure of your business is extremely balanced and has ideal conditions for sustainable growth.'
    
    if 50 <= overall_score < 80:
        status_text = 'Good'
        desc_text = 'Your business is generally healthy, but there are areas to optimize profit margin and cost control.'
    elif overall_score < 50:
        status_text = 'Needs Improvement'
        desc_text = 'Risks were detected in some critical financial metrics. You should urgently review costs and take growth-oriented steps.'
        
    return {
        "cash_flow_score": overall_score,
        "cash_flow_status": status_text,
        "cash_flow_comment": desc_text,
        "radar_metrics": [
            {"subject": "Profitability", "A": profitability, "fullMark": 100},
            {"subject": "Growth", "A": growth, "fullMark": 100},
            {"subject": "Cost Control", "A": cost_control, "fullMark": 100},
            {"subject": "Product Diversity", "A": product_diversity, "fullMark": 100},
            {"subject": "Stability", "A": stability, "fullMark": 100}
        ]
    }
