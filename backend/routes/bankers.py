# Routes banquiers — gestion du portefeuille de clients et opérations au nom d'un client.
# Ces routes sont réservées aux utilisateurs avec account_type = 'banker'.
# Nécessite la migration 004_add_banker_role.sql appliquée par Angie.

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db import get_db_connection
from models.virement import create_virement

bankers_bp = Blueprint('bankers', __name__)


def get_current_user(user_id):
    """Récupère l'utilisateur connecté depuis la base de données."""
    db = get_db_connection()
    if not db:
        return None
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, account_type FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    return user


def is_banker_client(banker_id, client_id):
    """Vérifie qu'un client appartient bien au portefeuille du banquier."""
    db = get_db_connection()
    if not db:
        return False
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id FROM banker_clients WHERE banker_id = %s AND client_id = %s",
        (banker_id, client_id)
    )
    result = cursor.fetchone()
    cursor.close()
    db.close()
    return result is not None


@bankers_bp.route('/bankers/clients', methods=['GET'])
@jwt_required()
def get_clients():
    """
    Retourne la liste des clients du banquier connecté.
    Accès réservé aux comptes avec account_type = 'banker'.
    """
    user_id = get_jwt_identity()
    user = get_current_user(user_id)

    if not user or user['account_type'] != 'banker':
        return jsonify({"error": "Accès réservé aux banquiers"}), 403

    db = get_db_connection()
    if not db:
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.balance, bc.assigned_at
           FROM banker_clients bc
           JOIN users u ON bc.client_id = u.id
           WHERE bc.banker_id = %s
           ORDER BY bc.assigned_at DESC""",
        (user_id,)
    )
    clients = cursor.fetchall()
    cursor.close()
    db.close()

    for c in clients:
        c['balance'] = float(c['balance'])
        c['assigned_at'] = str(c['assigned_at'])

    return jsonify({"clients": clients}), 200


@bankers_bp.route('/bankers/clients/<int:client_id>', methods=['POST'])
@jwt_required()
def add_client(client_id):
    """
    Ajoute un client au portefeuille du banquier connecté.
    Accès réservé aux comptes avec account_type = 'banker'.
    """
    user_id = get_jwt_identity()
    user = get_current_user(user_id)

    if not user or user['account_type'] != 'banker':
        return jsonify({"error": "Accès réservé aux banquiers"}), 403

    if str(client_id) == str(user_id):
        return jsonify({"error": "Un banquier ne peut pas être son propre client"}), 400

    db = get_db_connection()
    if not db:
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO banker_clients (banker_id, client_id) VALUES (%s, %s)",
            (user_id, client_id)
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Client ajouté au portefeuille"}), 201
    except Exception as e:
        db.rollback()
        cursor.close()
        db.close()
        return jsonify({"error": "Ce client est déjà dans votre portefeuille"}), 409


@bankers_bp.route('/bankers/clients/<int:client_id>/transfers', methods=['POST'])
@jwt_required()
def transfer_for_client(client_id):
    """
    Effectue un virement au nom d'un client du portefeuille du banquier.
    Le banquier doit avoir ce client dans son portefeuille.
    Champs requis : receiver_id, amount
    Champs optionnels : description, category_id
    """
    user_id = get_jwt_identity()
    user = get_current_user(user_id)

    if not user or user['account_type'] != 'banker':
        return jsonify({"error": "Accès réservé aux banquiers"}), 403

    # Vérifier que le client appartient bien au portefeuille du banquier
    if not is_banker_client(user_id, client_id):
        return jsonify({"error": "Ce client ne fait pas partie de votre portefeuille"}), 403

    data = request.json
    if not data or not data.get('receiver_id') or not data.get('amount'):
        return jsonify({"error": "receiver_id et amount sont requis"}), 400

    try:
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({"error": "Le montant doit être supérieur à 0"}), 400
    except ValueError:
        return jsonify({"error": "Montant invalide"}), 400

    if str(data['receiver_id']) == str(client_id):
        return jsonify({"error": "Le client ne peut pas s'envoyer de l'argent à lui-même"}), 400

    # Le virement est effectué depuis le compte du client (pas du banquier)
    virement, error = create_virement(
        sender_id=client_id,
        receiver_id=data['receiver_id'],
        amount=amount,
        description=data.get('description'),
        category_id=data.get('category_id')
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": f"Virement effectué au nom du client #{client_id}",
        "virement": virement
    }), 201


@bankers_bp.route('/bankers/clients/<int:client_id>/transfers', methods=['GET'])
@jwt_required()
def get_client_transfers(client_id):
    """
    Retourne l'historique des virements d'un client du portefeuille du banquier.
    """
    user_id = get_jwt_identity()
    user = get_current_user(user_id)

    if not user or user['account_type'] != 'banker':
        return jsonify({"error": "Accès réservé aux banquiers"}), 403

    if not is_banker_client(user_id, client_id):
        return jsonify({"error": "Ce client ne fait pas partie de votre portefeuille"}), 403

    from models.virement import get_virements_by_user
    virements = get_virements_by_user(client_id)
    return jsonify({"virements": virements}), 200
