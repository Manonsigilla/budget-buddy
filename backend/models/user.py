# Modèle utilisateur — fonctions d'accès à la table `users` en base de données.
# Gère aussi le hashage sécurisé des mots de passe (hashlib + sel + poivre).

import hashlib
import os
from utils.db import get_db_connection

# Le poivre est une valeur secrète fixe stockée dans les variables d'environnement.
# Contrairement au sel, il n'est jamais stocké en base de données.
PEPPER = os.getenv('PASSWORD_PEPPER', 'super_secret_pepper_dev')

def hash_password(password):
    """
    Hashe un mot de passe avec sel + poivre.
    - Le sel (os.urandom) est aléatoire et unique pour chaque utilisateur
    - Le poivre est fixe et secret (variable d'environnement)
    - pbkdf2_hmac répète le hashage 100 000 fois pour ralentir les attaques
    Format stocké en DB : "sel_hex:hash_hex"
    """
    salt = os.urandom(32)
    peppered = password + PEPPER
    key = hashlib.pbkdf2_hmac('sha256', peppered.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + key.hex()

def verify_password(plain_password, hashed_password):
    """
    Vérifie un mot de passe en le rehasant avec le même sel et poivre,
    puis compare le résultat avec le hash stocké en DB.
    """
    salt_hex, key_hex = hashed_password.split(':')
    salt = bytes.fromhex(salt_hex)
    peppered = plain_password + PEPPER
    key = hashlib.pbkdf2_hmac('sha256', peppered.encode('utf-8'), salt, 100000)
    return key.hex() == key_hex

def find_user_by_email(email):
    """Recherche un utilisateur par son email. Retourne None si non trouvé."""
    db = get_db_connection()
    if not db:
        return None
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    return user

def find_user_by_username(username):
    """Recherche un utilisateur par son nom d'utilisateur. Retourne None si non trouvé."""
    db = get_db_connection()
    if not db:
        return None
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    return user

def create_user(username, email, password, first_name, last_name):
    """
    Crée un nouvel utilisateur en base de données.
    Le mot de passe est hashé avant d'être stocké.
    Retourne l'ID du nouvel utilisateur, ou None en cas d'erreur.
    """
    db = get_db_connection()
    if not db:
        return None
    password_hash = hash_password(password)
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (%s, %s, %s, %s, %s)",
        (username, email, password_hash, first_name, last_name)
    )
    db.commit()
    user_id = cursor.lastrowid
    cursor.close()
    db.close()
    return user_id
