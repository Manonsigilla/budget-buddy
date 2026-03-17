from flask import Blueprint
from datetime import datetime
from utils.db import get_db_connection

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health():
    db = get_db_connection()
    db_status = "ok" if db else "unreachable"
    if db:
        db.close()
    return {
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }, 200
