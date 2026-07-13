from typing import List, Dict, Any

def get_chat_history(user_id: int, conn) -> List[Dict[str, Any]]:
    rows = conn.execute(
        "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC",
        (user_id,)
    ).fetchall()
    return [{"role": "ai" if r["role"] == "model" else "user", "content": r["content"]} for r in rows]

def insert_chat_message(user_id: int, role: str, content: str, conn):
    conn.execute(
        "INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)",
        (user_id, role, content)
    )

def clear_chat_history(user_id: int, conn):
    conn.execute("DELETE FROM chat_history WHERE user_id = ?", (user_id,))
