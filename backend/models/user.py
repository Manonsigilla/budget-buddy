import bcrypt
from utils.db import get_db_connection

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
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
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

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
