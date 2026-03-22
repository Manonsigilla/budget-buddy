# Utilitaire de connexion à la base de données MySQL.
# Chaque route qui a besoin de la DB appelle get_db_connection()
# et ferme la connexion après usage (cursor.close(), db.close()).

import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG

def get_db_connection():
    """Crée et retourne une connexion MySQL. Retourne None en cas d'échec."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Erreur de connexion à la DB: {e}")
        return None