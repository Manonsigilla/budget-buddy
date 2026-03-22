from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.message import (
    create_message, 
    get_messages_inbox, 
    get_messages_sent, 
    mark_message_as_read, 
    delete_message
)
from models.user import find_user_by_id

messages_bp = Blueprint('messages', __name__)


@messages_bp.route('/messages/inbox', methods=['GET'])
@jwt_required()
def get_inbox():
    """
    Récupère les messages reçus par l'utilisateur connecté.
    """
    user_id = get_jwt_identity()
    messages = get_messages_inbox(user_id)

    return jsonify([{
        "id": msg['id'],
        "sender_id": msg['sender_id'],
        "sender_name": f"{msg['first_name']} {msg['last_name']}",
        "sender_email": msg['email'],
        "subject": msg['subject'],
        "body": msg['body'],
        "created_at": str(msg['created_at']),
        "read_at": str(msg['read_at']) if msg['read_at'] else None,
        "is_read": msg['read_at'] is not None
    } for msg in messages]), 200


@messages_bp.route('/messages/sent', methods=['GET'])
@jwt_required()
def get_sent():
    """
    Récupère les messages envoyés par l'utilisateur connecté.
    """
    user_id = get_jwt_identity()
    messages = get_messages_sent(user_id)

    return jsonify([{
        "id": msg['id'],
        "receiver_id": msg['receiver_id'],
        "receiver_name": f"{msg['first_name']} {msg['last_name']}",
        "receiver_email": msg['email'],
        "subject": msg['subject'],
        "body": msg['body'],
        "created_at": str(msg['created_at']),
        "read_at": str(msg['read_at']) if msg['read_at'] else None,
        "is_read": msg['read_at'] is not None
    } for msg in messages]), 200


@messages_bp.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    """
    Envoie un message à un autre utilisateur.
    Body: { receiver_id: int, subject: string, body: string }
    """
    user_id = get_jwt_identity()
    data = request.json

    if not data or not data.get('receiver_id') or not data.get('subject') or not data.get('body'):
        return jsonify({"error": "receiver_id, subject et body sont requis"}), 400

    receiver_id = data.get('receiver_id')

    if receiver_id == user_id:
        return jsonify({"error": "Vous ne pouvez pas envoyer un message à vous-même"}), 400

    receiver = find_user_by_id(receiver_id)
    if not receiver:
        return jsonify({"error": "Destinataire non trouvé"}), 404

    message_id = create_message(user_id, receiver_id, data['subject'], data['body'])

    if not message_id:
        return jsonify({"error": "Erreur lors de l'envoi du message"}), 500

    return jsonify({
        "id": message_id,
        "message": "Message envoyé avec succès"
    }), 201


@messages_bp.route('/messages/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(message_id):
    """
    Marque un message comme lu.
    """
    user_id = get_jwt_identity()
    success = mark_message_as_read(message_id, user_id)

    if not success:
        return jsonify({"error": "Message non trouvé"}), 404

    return jsonify({"message": "Message marqué comme lu"}), 200


@messages_bp.route('/messages/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_msg(message_id):
    """
    Supprime un message.
    """
    user_id = get_jwt_identity()
    success = delete_message(message_id, user_id)

    if not success:
        return jsonify({"error": "Message non trouvé"}), 404

    return jsonify({"message": "Message supprimé"}), 200