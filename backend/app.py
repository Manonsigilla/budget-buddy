#  entry point flask

# backend/app.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.health import health_bp
from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'dev-secret-key'  # À mettre dans .env !
app.config['JWT_SECRET_KEY'] = 'dev-jwt-secret-key'  # À mettre dans .env !

JWTManager(app)

app.register_blueprint(health_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)