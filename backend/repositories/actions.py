from typing import List, Dict, Any

def get_actions(user_id: int, conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        "SELECT id, title, status, impact, financial_impact_value, created_at FROM actions WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    return [dict(a) for a in rows]

def create_action(user_id: int, data: Dict[str, Any], conn) -> int:
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO actions (user_id, title, impact, financial_impact_value) VALUES (?, ?, ?, ?)",
        (user_id, data["title"], data.get("impact"), data.get("financial_impact_value", 0.0))
    )
    return cursor.lastrowid

def update_action_status(user_id: int, action_id: int, status: str, conn):
    conn.execute(
        "UPDATE actions SET status = ? WHERE id = ? AND user_id = ?",
        (status, action_id, user_id)
    )
