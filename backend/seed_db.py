from sqlalchemy.exc import IntegrityError
import os
from backend.database import get_db_connection, init_db
from backend.security import hash_password

def seed():
    print("Initializing database tables...")
    init_db()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create Demo User
    email = "demo@insightai.com"
    password = "demo123"
    hashed = hash_password(password)
    business_name = "Gourmet Delights Cafe"
    business_type = "restaurant"
    
    print(f"Creating demo user: {email}")
    try:
        res = conn.execute(
            "INSERT INTO users (email, password_hash, business_name, business_type) VALUES (?, ?, ?, ?)",
            (email, hashed, business_name, business_type)
        )
        user_id = res.lastrowid
    except Exception:
        conn.rollback()
        # User already exists, retrieve id
        row = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        user_id = row["id"] if row else 1
        print(f"User {email} already exists (ID: {user_id}). Cleaning previous demo data...")
        # Clean previous data for this user to avoid duplication
        cursor.execute("DELETE FROM financial_records WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM products WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM personnel WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM restaurant_menu WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM actions WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM analysis_cache WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM chat_history WHERE user_id = ?", (user_id,))

    # 2. Add 12-Month Financial Records (with realistic seasonal curves for a restaurant)
    print("Seeding monthly financial records...")
    months_data = [
        {"date": "2025-07", "revenue": 45000.0, "expenses": 31000.0, "rent": 5000.0, "personnel": 12000.0, "marketing": 3000.0, "material": 9000.0, "other": 2000.0},
        {"date": "2025-08", "revenue": 48000.0, "expenses": 32500.0, "rent": 5000.0, "personnel": 12500.0, "marketing": 3500.0, "material": 9500.0, "other": 2000.0},
        {"date": "2025-09", "revenue": 42000.0, "expenses": 29800.0, "rent": 5000.0, "personnel": 11500.0, "marketing": 2500.0, "material": 8800.0, "other": 2000.0},
        {"date": "2025-10", "revenue": 39000.0, "expenses": 28500.0, "rent": 5000.0, "personnel": 11000.0, "marketing": 2000.0, "material": 8500.0, "other": 2000.0},
        {"date": "2025-11", "revenue": 37000.0, "expenses": 27900.0, "rent": 5000.0, "personnel": 10800.0, "marketing": 2100.0, "material": 8000.0, "other": 2000.0},
        {"date": "2025-12", "revenue": 46000.0, "expenses": 33000.0, "rent": 5000.0, "personnel": 13000.0, "marketing": 4000.0, "material": 9000.0, "other": 2000.0},
        {"date": "2026-01", "revenue": 35000.0, "expenses": 26500.0, "rent": 5000.0, "personnel": 10500.0, "marketing": 1500.0, "material": 7500.0, "other": 2000.0},
        {"date": "2026-02", "revenue": 36500.0, "expenses": 27200.0, "rent": 5000.0, "personnel": 10800.0, "marketing": 1800.0, "material": 7600.0, "other": 2000.0},
        {"date": "2026-03", "revenue": 40000.0, "expenses": 29000.0, "rent": 5000.0, "personnel": 11200.0, "marketing": 2500.0, "material": 8300.0, "other": 2000.0},
        {"date": "2026-04", "revenue": 43000.0, "expenses": 30500.0, "rent": 5000.0, "personnel": 11800.0, "marketing": 2800.0, "material": 8900.0, "other": 2000.0},
        {"date": "2026-05", "revenue": 47000.0, "expenses": 32800.0, "rent": 5000.0, "personnel": 12200.0, "marketing": 3500.0, "material": 10100.0, "other": 2000.0},
        {"date": "2026-06", "revenue": 52000.0, "expenses": 37200.0, "rent": 5000.0, "personnel": 14200.0, "marketing": 4000.0, "material": 12000.0, "other": 2000.0}
    ]
    
    for m in months_data:
        profit = m["revenue"] - m["expenses"]
        year = int(m["date"].split("-")[0])
        cursor.execute(
            """
            INSERT INTO financial_records 
            (user_id, date, year, revenue, expenses, profit, rent_expense, personnel_expense, marketing_expense, material_expense, other_expense)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, m["date"], year, m["revenue"], m["expenses"], profit, m["rent"], m["personnel"], m["marketing"], m["material"], m["other"])
        )

    # 3. Add Demo Products
    print("Seeding product performance details...")
    products = [
        {"name": "Classic Burger Combo", "revenue": 18000.0, "units": 1200, "cost": 6.50},
        {"name": "Pepperoni Pizza Slice", "revenue": 14400.0, "units": 1600, "cost": 3.20},
        {"name": "Iced Latte", "revenue": 8500.0, "units": 1700, "cost": 1.10},
        {"name": "San Sebastian Cheesecake", "revenue": 11100.0, "units": 1100, "cost": 2.80}
    ]
    for p in products:
        cursor.execute(
            "INSERT INTO products (user_id, name, revenue, units, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
            (user_id, p["name"], p["revenue"], p["units"], p["cost"])
        )

    # 4. Add Demo Personnel (including overtime triggers for warnings)
    print("Seeding personnel data...")
    personnel = [
        {"name": "John", "surname": "Doe", "role": "Chef", "salary": 4500.0, "overtime_hours": 24.5, "overtime_rate": 35.0},
        {"name": "Alice", "surname": "Smith", "role": "Kitchen Assistant", "salary": 2800.0, "overtime_hours": 10.0, "overtime_rate": 20.0},
        {"name": "Michael", "surname": "Johnson", "role": "Waiter", "salary": 2500.0, "overtime_hours": 0.0, "overtime_rate": 18.0}
    ]
    for p in personnel:
        overtime_expense = p["overtime_hours"] * p["overtime_rate"]
        cursor.execute(
            """
            INSERT INTO personnel (user_id, name, surname, role, monthly_salary, overtime_hours, overtime_rate, overtime_expense)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, p["name"], p["surname"], p["role"], p["salary"], p["overtime_hours"], p["overtime_rate"], overtime_expense)
        )

    # 5. Add Restaurant Menu Items (with food-cost warnings)
    print("Seeding restaurant menu items...")
    menu = [
        {"name": "Classic Burger Combo", "category": "Food", "price": 15.0, "cost": 6.80}, # Cost ratio: 45.3% (>35% warning)
        {"name": "Pepperoni Pizza Slice", "category": "Food", "price": 9.0, "cost": 3.20},  # Cost ratio: 35.5% (>30% threshold warning)
        {"name": "Iced Latte", "category": "Drink", "price": 5.0, "cost": 1.10},           # Cost ratio: 22.0%
        {"name": "San Sebastian Cheesecake", "category": "Food", "price": 10.0, "cost": 2.80} # Cost ratio: 28.0%
    ]
    for m in menu:
        cursor.execute(
            "INSERT INTO restaurant_menu (user_id, item_name, category, sale_price, portion_cost) VALUES (?, ?, ?, ?, ?)",
            (user_id, m["name"], m["category"], m["price"], m["cost"])
        )

    # 6. Add Default Actions
    print("Seeding initial action items...")
    actions = [
        {"title": "Optimize Classic Burger portion sizes to reduce food-cost", "status": "TODO", "impact": "+$1,200 estimated savings", "val": 1200.0},
        {"title": "Adjust weekend shift schedules to reduce chef overtime costs", "status": "TODO", "impact": "+$600 estimated savings", "val": 600.0},
        {"title": "Renegotiate packaging costs with local distributors", "status": "TODO", "impact": "+$400 estimated savings", "val": 400.0}
    ]
    for a in actions:
        cursor.execute(
            "INSERT INTO actions (user_id, title, status, impact, financial_impact_value) VALUES (?, ?, ?, ?, ?)",
            (user_id, a["title"], a["status"], a["impact"], a["val"])
        )
        
    conn.commit()
    conn.close()
    
    print("\n" + "="*50)
    print("Demo data seeded successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("="*50 + "\n")

if __name__ == "__main__":
    seed()
