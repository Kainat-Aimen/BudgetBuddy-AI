"""
BudgetBuddy AI - Database Layer
Owner: Member 2

Simple SQLite setup. Feel free to swap for SQLAlchemy if you prefer,
just keep the function signatures the same so app.py doesn't break.
"""

import sqlite3

DB_PATH = "budgetbuddy.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            description TEXT,
            category TEXT,
            date TEXT,
            is_anomaly INTEGER DEFAULT 0,
            source TEXT DEFAULT 'manual'
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_amount REAL NOT NULL,
            deadline TEXT,
            current_saved REAL DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()


def save_transaction(amount, description, category, date, is_anomaly=False, source="manual"):
    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO transactions (amount, description, category, date, is_anomaly, source) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (amount, description, category, date, int(is_anomaly), source),
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {
        "id": new_id,
        "amount": amount,
        "description": description,
        "category": category,
        "date": date,
        "is_anomaly": is_anomaly,
        "source": source,
    }


def get_transactions(category=None):
    conn = get_connection()
    if category:
        rows = conn.execute("SELECT * FROM transactions WHERE category = ?", (category,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM transactions").fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_goal(target_amount, deadline):
    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO goals (target_amount, deadline, current_saved) VALUES (?, ?, 0)",
        (target_amount, deadline),
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, "target_amount": target_amount, "deadline": deadline, "current_saved": 0}


def get_goals():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM goals").fetchall()
    conn.close()
    return [dict(row) for row in rows]
