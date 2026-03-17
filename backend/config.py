#  Config de base

# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'bank_user'),
    'password': os.getenv('DB_PASSWORD', 'bank_password_dev'),
    'database': os.getenv('DB_NAME', 'banking_app'),
    'port': int(os.getenv('DB_PORT', 3306))
}