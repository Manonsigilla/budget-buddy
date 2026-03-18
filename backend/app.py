# Point d'entrée principal du backend Flask.
# Ce fichier initialise l'application, configure les extensions
# et enregistre les blueprints (groupes de routes).

import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.health import health_bp
from routes.auth import auth_bp

app = Flask(__name__)

# Autorise les requêtes depuis le frontend (React sur localhost:3000)
CORS(app)

# Clés secrètes chargées depuis les variables d'environnement Docker
# Ne jamais mettre ces valeurs en dur dans le code en production
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key')

# Initialisation du gestionnaire de tokens JWT
JWTManager(app)

# Enregistrement des blueprints (routes groupées par fonctionnalité)
app.register_blueprint(health_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)