# Connexion MySQL

# backend/utils/db.py
import mysql.connector
from mysql.connector import Error
import os

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'bank_user'),
            password=os.getenv('DB_PASSWORD', 'bank_password_dev'),
            database=os.getenv('DB_NAME', 'banking_app'),
            port=int(os.getenv('DB_PORT', 3306))
        )
        return connection
    except Error as e:
        print(f"Error connecting to DB: {e}")
        return None