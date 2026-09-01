import sqlite3
from app.models.database import get_db_connection
from typing import Dict, Any

def log_query(query: str, response: Dict[str, Any], status: str = "success", session_id: str = None):
    """Log user queries, response summary, and execution metrics to SQLite."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO query_logs (session_id, query, mode, language, confidence, processing_time, status, response_preview)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id or response.get("session_id", "default"),
            query,
            response.get("mode", "simple"),
            response.get("language", "en"),
            float(response.get("confidence", 0)),
            float(response.get("processing_time", 0.0)),
            status,
            (response.get("answer", "")[:250] + "...") if response.get("answer") else ""
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Audit Log Error] {e}")

def record_feedback(session_id: str, message_id: str, rating: str, comment: str = None):
    """Record user feedback (thumbs up / down)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO feedback (session_id, message_id, rating, comment)
        VALUES (?, ?, ?, ?)
        """, (session_id, message_id, rating, comment))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[Feedback Log Error] {e}")
        return False
