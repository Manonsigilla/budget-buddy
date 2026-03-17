#  entry point flask

# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import jwt

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'dev-secret-key'  # À mettre dans .env !

@app.route('/health', methods=['GET'])
def health():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }, 200

@app.route('/auth/register', methods=['POST'])
def register():
    """À implémenter avec validation + hash"""
    data = request.json
    # Validation
    # Hash password
    # Insert en DB
    return {"message": "User created"}, 201

@app.route('/auth/login', methods=['POST'])
def login():
    """À implémenter avec vérification password + JWT"""
    data = request.json
    # Vérifier credentials
    # Générer JWT token
    return {
        "token": "jwt_token_here",
        "user": {"id": 1, "username": "..."}
    }, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)