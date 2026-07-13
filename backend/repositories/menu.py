from typing import List, Dict, Any, Optional

def get_menu(user_id: int, conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        "SELECT id, item_name, category, sale_price, portion_cost FROM restaurant_menu WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    return [dict(m) for m in rows]

def create_menu_item(user_id: int, data: Dict[str, Any], conn) -> int:
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO restaurant_menu (user_id, item_name, category, sale_price, portion_cost)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user_id, data["item_name"], data["category"], data["sale_price"], data["portion_cost"])
    )
    return cursor.lastrowid

def get_menu_item_by_id(user_id: int, menu_id: int, conn) -> Optional[dict]:
    row = conn.execute(
        "SELECT id FROM restaurant_menu WHERE id = ? AND user_id = ?",
        (menu_id, user_id)
    ).fetchone()
    return dict(row) if row else None

def delete_menu_item(user_id: int, menu_id: int, conn):
    conn.execute("DELETE FROM restaurant_menu WHERE id = ? AND user_id = ?", (menu_id, user_id))
