# Routes virements — envoi d'argent et historique des transactions.
# Toutes ces routes sont protégées par JWT : il faut être connecté pour y accéder.

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.virement import create_virement, get_virements_by_user

virements_bp = Blueprint('virements', __name__)


@virements_bp.route('/virements', methods=['POST'])
@virements_bp.route('/transfers', methods=['POST'])  # alias pour le frontend
@jwt_required()
def send_virement():
    """
    Effectue un virement vers un autre utilisateur.
    Champs requis : receiver_id, amount
    Champs optionnels : description, category_id
    """
    sender_id = get_jwt_identity()
    data = request.json

    if not data or not data.get('receiver_id') or not data.get('amount'):
        return jsonify({"error": "receiver_id et amount sont requis"}), 400

    # Vérifier que le montant est positif
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({"error": "Le montant doit être supérieur à 0"}), 400
    except ValueError:
        return jsonify({"error": "Montant invalide"}), 400

    # Vérifier que l'utilisateur ne s'envoie pas à lui-même
    if str(data['receiver_id']) == str(sender_id):
        return jsonify({"error": "Vous ne pouvez pas vous envoyer de l'argent à vous-même"}), 400

    virement, error = create_virement(
        sender_id=sender_id,
        receiver_id=data['receiver_id'],
        amount=amount,
        description=data.get('description'),
        category_id=data.get('category_id')
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": "Virement effectué avec succès",
        "virement": virement
    }), 201


@virements_bp.route('/virements', methods=['GET'])
@jwt_required()
def get_virements():
    """
    Retourne l'historique des virements de l'utilisateur connecté.
    Inclut les virements envoyés ET reçus.
    """
    user_id = get_jwt_identity()
    virements = get_virements_by_user(user_id)
    return jsonify({"virements": virements}), 200


@virements_bp.route('/transfers', methods=['GET'])  # alias pour le frontend
@jwt_required()
def get_transfers():
    """
    Alias de GET /virements pour compatibilité avec le frontend.
    Retourne directement un tableau (format attendu par les hooks React).
    """
    user_id = get_jwt_identity()
    virements = get_virements_by_user(user_id)
    return jsonify(virements), 200


@virements_bp.route('/transfers', methods=['POST'])  # alias pour le frontend
@jwt_required()
def create_transfer():
    """
    Alias de POST /virements pour compatibilité avec le frontend.
    """
    sender_id = get_jwt_identity()
    data = request.json

    if not data or not data.get('receiver_id') or not data.get('amount'):
        return jsonify({"error": "receiver_id et amount sont requis"}), 400

    try:
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({"error": "Le montant doit être supérieur à 0"}), 400
    except ValueError:
        return jsonify({"error": "Montant invalide"}), 400

    if str(data['receiver_id']) == str(sender_id):
        return jsonify({"error": "Vous ne pouvez pas vous envoyer de l'argent à vous-même"}), 400

    virement, error = create_virement(
        sender_id=sender_id,
        receiver_id=data['receiver_id'],
        amount=amount,
        description=data.get('description'),
        category_id=data.get('category_id')
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": "Virement effectué avec succès",
        "virement": virement
    }), 201
