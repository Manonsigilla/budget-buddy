# Point d'entrée principal du backend Flask.
# Ce fichier initialise l'application, configure les extensions
# et enregistre les blueprints (groupes de routes).

import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.health import health_bp
from routes.auth import auth_bp
from routes.users import users_bp
from routes.virements import virements_bp
from routes.notifications import notifications_bp
from routes.bankers import bankers_bp
from routes.messages import messages_bp

app = Flask(__name__)

# Autorise les requêtes depuis le frontend (React sur localhost:3000)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Gestionnaire d'erreurs global pour éviter les erreurs CORS (null) lors des 500
@app.errorhandler(Exception)
def handle_exception(e):
    """Capture toutes les erreurs non gérées et retourne du JSON avec les bons headers."""
    # Log de l'erreur pour le debug Docker
    app.logger.error(f"Erreur non gérée: {str(e)}")
    
    # Prépare la réponse JSON
    response = jsonify({
        "error": "Une erreur interne est survenue",
        "message": str(e),
        "code": 500
    })
    
    # Assure que les headers CORS sont présents même en cas d'erreur
    # Flask-CORS le fait normalement, mais un crash brutal peut parfois le bypasser
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    
    return response, 500

# Clés secrètes chargées depuis les variables d'environnement Docker
# Ne jamais mettre ces valeurs en dur dans le code en production
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)

# Initialisation du gestionnaire de tokens JWT
jwt = JWTManager(app)

# Gestion explicite des erreurs JWT — retourne du JSON propre au lieu d'une erreur HTML
@jwt.expired_token_loader
def expired_token_callback(_jwt_header, _jwt_payload):
    """Token expiré — le frontend doit rediriger vers la page de login."""
    return jsonify({"error": "Token expiré, veuillez vous reconnecter", "code": "token_expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(_error):
    """Token invalide ou malformé."""
    return jsonify({"error": "Token invalide", "code": "token_invalid"}), 401

@jwt.unauthorized_loader
def missing_token_callback(_error):
    """Aucun token fourni."""
    return jsonify({"error": "Token manquant, authentification requise", "code": "token_missing"}), 401

# Enregistrement des blueprints (routes groupées par fonctionnalité)
app.register_blueprint(health_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(virements_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(bankers_bp)
app.register_blueprint(messages_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)