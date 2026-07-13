import sqlite3
from backend.config import settings

def get_db_connection():
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        business_name TEXT DEFAULT 'My Business',
        business_type TEXT DEFAULT 'general'
    )
    """)
    
    # Financial records table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS financial_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        year INTEGER,
        revenue REAL NOT NULL,
        expenses REAL NOT NULL,
        profit REAL NOT NULL,
        rent_expense REAL DEFAULT 0,
        personnel_expense REAL DEFAULT 0,
        marketing_expense REAL DEFAULT 0,
        material_expense REAL DEFAULT 0,
        other_expense REAL DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Ensure year column exists in financial_records if table already existed
    try:
        cursor.execute("ALTER TABLE financial_records ADD COLUMN year INTEGER")
    except sqlite3.OperationalError:
        pass
    
    # Products table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        revenue REAL NOT NULL,
        units INTEGER NOT NULL,
        cost_per_unit REAL DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Chat history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    # Actions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'TODO',
        impact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Scenario results table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scenario_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scenario_type TEXT NOT NULL,
        params TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # User preferences table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        theme TEXT DEFAULT 'light',
        notifications_enabled INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # AI Analysis cache table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        summary TEXT NOT NULL,
        insights TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Personnel table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS personnel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        role TEXT NOT NULL,
        monthly_salary REAL DEFAULT 0,
        overtime_hours REAL DEFAULT 0,
        overtime_rate REAL DEFAULT 0,
        overtime_expense REAL DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Ensure monthly_salary and overtime_rate columns exist in personnel if table already existed
    try:
        cursor.execute("ALTER TABLE personnel ADD COLUMN monthly_salary REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE personnel ADD COLUMN overtime_rate REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    
    # Restaurant menu table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS restaurant_menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        sale_price REAL NOT NULL,
        portion_cost REAL NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Ensure financial_impact_value column exists in actions if table already existed
    try:
        cursor.execute("ALTER TABLE actions ADD COLUMN financial_impact_value REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
