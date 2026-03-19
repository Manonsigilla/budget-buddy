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

def find_user_by_id(user_id):
    """Recherche un utilisateur par son ID. Retourne None si non trouvé."""
    db = get_db_connection()
    if not db:
        return None
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
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

def update_user(user_id, data):
    """
    Met à jour les champs du profil utilisateur.
    Seuls les champs autorisés et présents dans data sont modifiés.
    Retourne True si la mise à jour a réussi, False sinon.
    """
    allowed_fields = ['username', 'email', 'first_name', 'last_name']
    fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not fields:
        return False

    db = get_db_connection()
    if not db:
        return False

    set_clause = ', '.join([f"{k} = %s" for k in fields])
    values = list(fields.values()) + [user_id]
    cursor = db.cursor()
    cursor.execute(f"UPDATE users SET {set_clause} WHERE id = %s", values)
    db.commit()
    cursor.close()
    db.close()
    return True

def update_password(user_id, old_password, new_password):
    """
    Change le mot de passe de l'utilisateur après vérification de l'ancien.
    Retourne True si le changement a réussi, False si l'ancien mot de passe est incorrect.
    """
    user = find_user_by_id(user_id)
    if not user or not verify_password(old_password, user['password_hash']):
        return False

    db = get_db_connection()
    if not db:
        return False

    new_hash = hash_password(new_password)
    cursor = db.cursor()
    cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
    db.commit()
    cursor.close()
    db.close()
    return True

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
