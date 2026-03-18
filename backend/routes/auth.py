# Routes d'authentification : inscription et connexion.
# Les tokens JWT générés au login sont ensuite utilisés
# pour accéder aux routes protégées (Phase 3).

import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import find_user_by_email, find_user_by_username, create_user, verify_password

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    """Vérifie que l'email contient un @ et un domaine valide (ex: alice@test.com)."""
    return re.match(r'^[^@]+@[^@]+\.[^@]+$', email) is not None

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.json

    # Validation des champs requis
    required = ['username', 'email', 'password', 'first_name', 'last_name']
    for field in required:
        if not data or not data.get(field):
            return jsonify({"error": f"Le champ '{field}' est requis"}), 400

    # Validation du format email
    if not is_valid_email(data['email']):
        return jsonify({"error": "Format d'email invalide"}), 400

    # Validation de la longueur du mot de passe
    if len(data['password']) < 8:
        return jsonify({"error": "Le mot de passe doit contenir au moins 8 caractères"}), 400

    # Vérifier que l'email ou username n'existe pas déjà
    if find_user_by_email(data['email']):
        return jsonify({"error": "Cet email est déjà utilisé"}), 409
    if find_user_by_username(data['username']):
        return jsonify({"error": "Ce nom d'utilisateur est déjà pris"}), 409

    user_id = create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        first_name=data['first_name'],
        last_name=data['last_name']
    )

    if not user_id:
        return jsonify({"error": "Erreur lors de la création du compte"}), 500

    return jsonify({"message": "Compte créé avec succès", "user_id": user_id}), 201


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email et mot de passe requis"}), 400

    user = find_user_by_email(data['email'])

    # On retourne intentionnellement le même message pour email et mot de passe incorrect.
    # Cela évite d'indiquer à un attaquant si l'email existe en base de données.
    if not user or not verify_password(data['password'], user['password_hash']):
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401

    token = create_access_token(identity=str(user['id']))

    return jsonify({
        "token": token,
        "user": {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "first_name": user['first_name'],
            "last_name": user['last_name'],
            "balance": float(user['balance'])
        }
    }), 200
