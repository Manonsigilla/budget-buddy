# Configuration de la base de données.
# Les valeurs sont lues depuis les variables d'environnement Docker
# définies dans docker-compose.yml. Les valeurs par défaut sont
# uniquement là pour le développement local sans Docker.

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