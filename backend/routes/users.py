# Routes utilisateurs — accès au profil et aux infos de l'utilisateur connecté.
# Toutes ces routes sont protégées par JWT : il faut être connecté pour y accéder.

import re
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import find_user_by_id, find_user_by_email, update_user, update_password, find_all_users

users_bp = Blueprint('users', __name__)


@users_bp.route('/users/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Retourne les infos de l'utilisateur actuellement connecté.
    L'identité est extraite automatiquement depuis le token JWT.
    """
    user_id = get_jwt_identity()
    user = find_user_by_id(user_id)

    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    return jsonify({
        "id": user['id'],
        "username": user['username'],
        "email": user['email'],
        "first_name": user['first_name'],
        "last_name": user['last_name'],
        "balance": float(user['balance'])
    }), 200


@users_bp.route('/users/me', methods=['PUT'])
@jwt_required()
def update_me():
    """
    Modifie les infos de l'utilisateur connecté (nom, email, username).
    Seuls les champs fournis dans la requête sont mis à jour.
    """
    user_id = get_jwt_identity()
    data = request.json

    if not data:
        return jsonify({"error": "Aucune donnée fournie"}), 400

    # Validation email si fourni
    if 'email' in data:
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', data['email']):
            return jsonify({"error": "Format d'email invalide"}), 400
        # Vérifier que l'email n'est pas déjà pris par un autre utilisateur
        existing = find_user_by_email(data['email'])
        if existing and str(existing['id']) != str(user_id):
            return jsonify({"error": "Cet email est déjà utilisé"}), 409

    success = update_user(user_id, data)
    if not success:
        return jsonify({"error": "Erreur lors de la mise à jour"}), 500

    user = find_user_by_id(user_id)
    return jsonify({
        "id": user['id'],
        "username": user['username'],
        "email": user['email'],
        "first_name": user['first_name'],
        "last_name": user['last_name'],
        "balance": float(user['balance'])
    }), 200


@users_bp.route('/users/me/password', methods=['PUT'])
@jwt_required()
def change_password():
    """
    Permet à l'utilisateur connecté de changer son mot de passe.
    L'ancien mot de passe est vérifié avant d'autoriser le changement.
    """
    user_id = get_jwt_identity()
    data = request.json

    if not data or not data.get('old_password') or not data.get('new_password'):
        return jsonify({"error": "Ancien et nouveau mot de passe requis"}), 400

    if len(data['new_password']) < 8:
        return jsonify({"error": "Le nouveau mot de passe doit contenir au moins 8 caractères"}), 400

    success = update_password(user_id, data['old_password'], data['new_password'])
    if not success:
        return jsonify({"error": "Ancien mot de passe incorrect"}), 401

    return jsonify({"message": "Mot de passe mis à jour avec succès"}), 200

@users_bp.route('/users', methods=['GET'])
def get_all_users():
    """
    Retourne la liste de tous les utilisateurs.
    """
    users = find_all_users()  # Utilise une fonction de la DB
    
    return jsonify([{
        "id": user['id'],
        "username": user['username'],
        "email": user['email'],
        "first_name": user['first_name'],
        "last_name": user['last_name'],
        "balance": float(user['balance'])
    } for user in users]), 200