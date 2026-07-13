from typing import Optional, List, Dict, Any

def get_financial_records(user_id: int, conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        "SELECT id, date, year, revenue, expenses, profit, rent_expense, personnel_expense, marketing_expense, material_expense, other_expense FROM financial_records WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    return [dict(r) for r in rows]

def get_products(user_id: int, conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        "SELECT id, name, revenue, units, cost_per_unit FROM products WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    return [dict(p) for p in rows]

def delete_all_financial_records(user_id: int, conn):
    conn.execute("DELETE FROM financial_records WHERE user_id = ?", (user_id,))

def delete_all_products(user_id: int, conn):
    conn.execute("DELETE FROM products WHERE user_id = ?", (user_id,))

def insert_financial_record(user_id: int, data: Dict[str, Any], conn):
    conn.execute(
        """
        INSERT INTO financial_records 
        (user_id, date, year, revenue, expenses, profit, rent_expense, personnel_expense, marketing_expense, material_expense, other_expense) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            data["date"],
            data.get("year"),
            data["revenue"],
            data["expenses"],
            data["profit"],
            data.get("rent_expense", 0.0),
            data.get("personnel_expense", 0.0),
            data.get("marketing_expense", 0.0),
            data.get("material_expense", 0.0),
            data.get("other_expense", 0.0)
        )
    )

def insert_product(user_id: int, data: Dict[str, Any], conn):
    conn.execute(
        "INSERT INTO products (user_id, name, revenue, units, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
        (user_id, data["name"], data["revenue"], data["units"], data.get("cost_per_unit", 0.0))
    )

def get_financial_record_by_id(user_id: int, record_id: int, conn) -> Optional[dict]:
    row = conn.execute(
        "SELECT id FROM financial_records WHERE id = ? AND user_id = ?",
        (record_id, user_id)
    ).fetchone()
    return dict(row) if row else None

def get_product_by_id(user_id: int, product_id: int, conn) -> Optional[dict]:
    row = conn.execute(
        "SELECT id FROM products WHERE id = ? AND user_id = ?",
        (product_id, user_id)
    ).fetchone()
    return dict(row) if row else None

def delete_financial_record(user_id: int, record_id: int, conn):
    conn.execute("DELETE FROM financial_records WHERE id = ? AND user_id = ?", (record_id, user_id))

def delete_product(user_id: int, product_id: int, conn):
    conn.execute("DELETE FROM products WHERE id = ? AND user_id = ?", (product_id, user_id))
