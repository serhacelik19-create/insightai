from typing import List, Dict, Any, Optional

def get_personnel(user_id: int, conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        "SELECT id, name, surname, role, monthly_salary, overtime_hours, overtime_rate, overtime_expense FROM personnel WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    return [dict(p) for p in rows]

def create_personnel(user_id: int, data: Dict[str, Any], conn) -> int:
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO personnel (user_id, name, surname, role, monthly_salary, overtime_hours, overtime_rate, overtime_expense)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            data["name"],
            data["surname"],
            data["role"],
            data["monthly_salary"],
            data.get("overtime_hours", 0.0),
            data.get("overtime_rate", 0.0),
            data.get("overtime_expense", 0.0)
        )
    )
    return cursor.lastrowid

def get_personnel_by_id(user_id: int, personnel_id: int, conn) -> Optional[dict]:
    row = conn.execute(
        "SELECT id FROM personnel WHERE id = ? AND user_id = ?",
        (personnel_id, user_id)
    ).fetchone()
    return dict(row) if row else None

def delete_personnel(user_id: int, personnel_id: int, conn):
    conn.execute("DELETE FROM personnel WHERE id = ? AND user_id = ?", (personnel_id, user_id))

def sync_personnel_expenses(user_id: int, conn):
    cursor = conn.cursor()
    total_personnel_cost = cursor.execute(
        "SELECT SUM(monthly_salary + overtime_expense) FROM personnel WHERE user_id = ?",
        (user_id,)
    ).fetchone()[0] or 0.0
    
    recent_record = conn.execute(
        "SELECT id, revenue, rent_expense, marketing_expense, material_expense, other_expense FROM financial_records WHERE user_id = ? ORDER BY date DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    
    if recent_record:
        rec_id = recent_record["id"]
        revenue = recent_record["revenue"]
        rent = recent_record["rent_expense"] or 0.0
        marketing = recent_record["marketing_expense"] or 0.0
        material = recent_record["material_expense"] or 0.0
        other = recent_record["other_expense"] or 0.0
        
        new_expenses = rent + total_personnel_cost + marketing + material + other
        new_profit = revenue - new_expenses
        
        conn.execute(
            """
            UPDATE financial_records 
            SET personnel_expense = ?, expenses = ?, profit = ?
            WHERE id = ?
            """,
            (total_personnel_cost, new_expenses, new_profit, rec_id)
        )
