import os
from sqlalchemy import create_engine, text
from backend.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

class PostgreSQLRowAdapter(dict):
    """Row adapter providing dict-like access and positional index access."""
    def __init__(self, mapping):
        super().__init__(mapping)
    
    def __getitem__(self, item):
        if isinstance(item, int):
            return list(self.values())[item]
        return super().__getitem__(item)

class PostgreSQLResultAdapter:
    def __init__(self, result, lastrowid=None):
        self._result = result
        self.lastrowid = lastrowid

    def fetchone(self):
        if self._result is None:
            return None
        row = self._result.mappings().fetchone()
        return PostgreSQLRowAdapter(row) if row is not None else None

    def fetchall(self):
        if self._result is None:
            return []
        rows = self._result.mappings().fetchall()
        return [PostgreSQLRowAdapter(r) for r in rows]

class DBCursorWrapper:
    def __init__(self, parent_conn):
        self.parent = parent_conn
        self.lastrowid = None

    def execute(self, sql_str, params=()):
        resAdapter = self.parent.execute(sql_str, params)
        self.lastrowid = resAdapter.lastrowid
        return resAdapter

    def fetchone(self):
        return None

    def fetchall(self):
        return []

class DBConnectionWrapper:
    def __init__(self):
        self._conn = engine.connect()
        self._trans = self._conn.begin()

    def execute(self, sql_str, params=()):
        param_dict = {}
        new_sql = sql_str
        
        # Convert any legacy SQLite type definitions to PostgreSQL standards
        new_sql = new_sql.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
        new_sql = new_sql.replace("REAL", "DOUBLE PRECISION")
        
        if isinstance(params, (tuple, list)):
            formatted_sql = ""
            param_idx = 0
            for char in new_sql:
                if char == '?':
                    pname = f"p{param_idx}"
                    formatted_sql += f":{pname}"
                    param_dict[pname] = params[param_idx]
                    param_idx += 1
                else:
                    formatted_sql += char
            new_sql = formatted_sql
        elif isinstance(params, dict):
            param_dict = params

        lastrowid = None
        if new_sql.strip().upper().startswith("INSERT") and "RETURNING" not in new_sql.upper():
            new_sql += " RETURNING id"
            result = self._conn.execute(text(new_sql), param_dict)
            row = result.fetchone()
            if row:
                lastrowid = row[0]
            return PostgreSQLResultAdapter(None, lastrowid=lastrowid)

        result = self._conn.execute(text(new_sql), param_dict)
        return PostgreSQLResultAdapter(result, lastrowid=lastrowid)

    def cursor(self):
        return DBCursorWrapper(self)

    def commit(self):
        if hasattr(self, '_trans') and self._trans and self._trans.is_active:
            self._trans.commit()
            self._trans = self._conn.begin()

    def rollback(self):
        if hasattr(self, '_trans') and self._trans and self._trans.is_active:
            self._trans.rollback()
            self._trans = self._conn.begin()

    def close(self):
        if hasattr(self, '_trans') and self._trans and self._trans.is_active:
            self._trans.rollback()
        self._conn.close()

def get_db_connection():
    return DBConnectionWrapper()

def init_db():
    conn = get_db_connection()
    
    # Users table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) DEFAULT 'My Business',
        business_type VARCHAR(255) DEFAULT 'general'
    )
    """)
    
    # Financial records table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS financial_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date VARCHAR(20) NOT NULL,
        year INTEGER,
        revenue DOUBLE PRECISION NOT NULL,
        expenses DOUBLE PRECISION NOT NULL,
        profit DOUBLE PRECISION NOT NULL,
        rent_expense DOUBLE PRECISION DEFAULT 0,
        personnel_expense DOUBLE PRECISION DEFAULT 0,
        marketing_expense DOUBLE PRECISION DEFAULT 0,
        material_expense DOUBLE PRECISION DEFAULT 0,
        other_expense DOUBLE PRECISION DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Products table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        revenue DOUBLE PRECISION NOT NULL,
        units INTEGER NOT NULL,
        cost_per_unit DOUBLE PRECISION DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Chat history table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Actions table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS actions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(550) NOT NULL,
        status VARCHAR(50) DEFAULT 'TODO',
        impact VARCHAR(255),
        financial_impact_value DOUBLE PRECISION DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Scenario results table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS scenario_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        scenario_type VARCHAR(100) NOT NULL,
        params TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # User preferences table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        theme VARCHAR(50) DEFAULT 'light',
        notifications_enabled INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # AI Analysis cache table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS analysis_cache (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        summary TEXT NOT NULL,
        insights TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Personnel table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS personnel (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        monthly_salary DOUBLE PRECISION DEFAULT 0,
        overtime_hours DOUBLE PRECISION DEFAULT 0,
        overtime_rate DOUBLE PRECISION DEFAULT 0,
        overtime_expense DOUBLE PRECISION DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Restaurant menu table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS restaurant_menu (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        sale_price DOUBLE PRECISION NOT NULL,
        portion_cost DOUBLE PRECISION NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("PostgreSQL Database initialized successfully.")
