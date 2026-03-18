import hashlib
import os
from utils.db import get_db_connection

PEPPER = os.getenv('PASSWORD_PEPPER', 'super_secret_pepper_dev')

def hash_password(password):
    salt = os.urandom(32)
    peppered = password + PEPPER
    key = hashlib.pbkdf2_hmac('sha256', peppered.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + key.hex()

def verify_password(plain_password, hashed_password):
    salt_hex, key_hex = hashed_password.split(':')
    salt = bytes.fromhex(salt_hex)
    peppered = plain_password + PEPPER
    key = hashlib.pbkdf2_hmac('sha256', peppered.encode('utf-8'), salt, 100000)
    return key.hex() == key_hex

def find_user_by_email(email):
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
