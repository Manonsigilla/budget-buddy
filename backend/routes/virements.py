# Routes virements — envoi d'argent et historique des transactions.
# Toutes ces routes sont protégées par JWT : il faut être connecté pour y accéder.

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.virement import create_virement, get_virements_by_user

virements_bp = Blueprint('virements', __name__)


def _process_virement(sender_id, data):
    """
    Logique commune pour POST /virements et POST /transfers.
    Valide les données, crée le virement et retourne la réponse.
    """
    if not data or not data.get('receiver_id') or not data.get('amount'):
        return jsonify({"error": "receiver_id et amount sont requis"}), 400

    # Valider que receiver_id est bien un entier
    try:
        receiver_id = int(data['receiver_id'])
    except (ValueError, TypeError):
        return jsonify({"error": "receiver_id doit être un entier"}), 400

    # Valider que le montant est un nombre positif
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({"error": "Le montant doit être supérieur à 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Montant invalide"}), 400

    # Vérifier que l'utilisateur ne s'envoie pas à lui-même
    if receiver_id == int(sender_id):
        return jsonify({"error": "Vous ne pouvez pas vous envoyer de l'argent à vous-même"}), 400

    virement, error = create_virement(
        sender_id=sender_id,
        receiver_id=receiver_id,
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


@virements_bp.route('/virements', methods=['POST'])
@jwt_required()
def send_virement():
    """
    Effectue un virement vers un autre utilisateur.
    Champs requis : receiver_id (int), amount (float)
    Champs optionnels : description, category_id
    """
    return _process_virement(get_jwt_identity(), request.json)


@virements_bp.route('/transfers', methods=['POST'])
@jwt_required()
def create_transfer():
    """
    Alias de POST /virements pour compatibilité avec le frontend.
    Champs requis : receiver_id (int), amount (float)
    """
    return _process_virement(get_jwt_identity(), request.json)


def _get_filters_from_request():
    """
    Extrait les filtres communs depuis les query params de la requête.
    Utilisé par GET /virements et GET /transfers.
    """
    return {
        'date':        request.args.get('date'),
        'date_start':  request.args.get('date_start'),
        'date_end':    request.args.get('date_end'),
        'category_id': request.args.get('category_id'),
        'type':        request.args.get('type'),
        'sort':        request.args.get('sort'),
    }


@virements_bp.route('/virements', methods=['GET'])
@jwt_required()
def get_virements():
    """
    Retourne l'historique des virements de l'utilisateur connecté.
    Paramètres optionnels (query string) :
    - date        : ex: ?date=2026-03-22
    - date_start  : ex: ?date_start=2026-01-01
    - date_end    : ex: ?date_end=2026-03-22
    - category_id : ex: ?category_id=1
    - type        : ex: ?type=sent ou ?type=received
    - sort        : ex: ?sort=asc ou ?sort=desc (par montant)
    Retourne : {"virements": [...]}
    """
    user_id = get_jwt_identity()
    virements = get_virements_by_user(user_id, _get_filters_from_request())
    return jsonify({"virements": virements}), 200


@virements_bp.route('/transfers', methods=['GET'])
@jwt_required()
def get_transfers():
    """
    Alias de GET /virements pour compatibilité avec le frontend.
    Accepte les mêmes filtres en query string.
    Retourne : [...] (tableau brut, format attendu par useTransfers.ts)
    """
    user_id = get_jwt_identity()
    virements = get_virements_by_user(user_id, _get_filters_from_request())
    return jsonify(virements), 200

@virements_bp.route('/virements/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """
    Retourne la liste de toutes les catégories de virements.
    """
    from models.virement import get_categories_with_names
    
    categories = get_categories_with_names()
    
    return jsonify([{
        "id": cat['id'],
        "name": cat['name']
    } for cat in categories]), 200
