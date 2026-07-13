from typing import Optional

def get_user_by_email(email: str, conn) -> Optional[dict]:
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    return dict(row) if row else None

def get_user_by_id(user_id: int, conn) -> Optional[dict]:
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return dict(row) if row else None

def create_user(email: str, password_hash: str, business_name: str, business_type: str, conn) -> int:
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (email, password_hash, business_name, business_type) VALUES (?, ?, ?, ?)",
        (email, password_hash, business_name, business_type)
    )
    return cursor.lastrowid

def update_profile(user_id: int, business_name: str, business_type: str, conn):
    conn.execute(
        "UPDATE users SET business_name = ?, business_type = ? WHERE id = ?",
        (business_name, business_type, user_id)
    )

def update_credentials(user_id: int, email: Optional[str], password_hash: Optional[str], conn):
    if email and password_hash:
        conn.execute("UPDATE users SET email = ?, password_hash = ? WHERE id = ?", (email, password_hash, user_id))
    elif email:
        conn.execute("UPDATE users SET email = ? WHERE id = ?", (email, user_id))
    elif password_hash:
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))
