import json
from typing import Optional, Dict, Any

def get_cached_analysis(user_id: int, conn) -> Optional[Dict[str, Any]]:
    row = conn.execute(
        "SELECT summary, insights, created_at FROM analysis_cache WHERE user_id = ?",
        (user_id,)
    ).fetchone()
    return dict(row) if row else None

def save_analysis_to_cache(user_id: int, summary: str, insights: list, conn):
    conn.execute(
        """
        INSERT INTO analysis_cache (user_id, summary, insights, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            summary = excluded.summary,
            insights = excluded.insights,
            created_at = CURRENT_TIMESTAMP
        """,
        (user_id, summary, json.dumps(insights))
    )
