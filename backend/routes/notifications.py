# Routes notifications — récupération et marquage comme lu des notifications utilisateur.

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db import get_db_connection

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Retourne toutes les notifications de l'utilisateur connecté, triées du plus récent au plus ancien."""
    user_id = get_jwt_identity()
    db = get_db_connection()
    if not db:
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """SELECT id, type, title, message, is_read, created_at
           FROM notifications
           WHERE user_id = %s
           ORDER BY created_at DESC""",
        (user_id,)
    )
    notifications = cursor.fetchall()
    cursor.close()
    db.close()

    for n in notifications:
        n['created_at'] = str(n['created_at'])
        n['is_read'] = bool(n['is_read'])

    return jsonify({"notifications": notifications}), 200


@notifications_bp.route('/notifications/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notif_id):
    """Marque une notification comme lue."""
    user_id = get_jwt_identity()
    db = get_db_connection()
    if not db:
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    cursor = db.cursor()
    cursor.execute(
        """UPDATE notifications SET is_read = 1, read_at = NOW()
           WHERE id = %s AND user_id = %s""",
        (notif_id, user_id)
    )
    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Notification marquée comme lue"}), 200
