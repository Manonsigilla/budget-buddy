"""
Script de seeding des utilisateurs de test avec de vrais mots de passe hashes.
Utilise la meme logique de hashage que le backend (hashlib + sel + poivre).

Usage:
    python seed_users.py

    Ou via Docker:
    docker exec -it banking_app_api python /app/../database/seed_users.py
"""

import hashlib
import os
import sys
import time
import random
from datetime import datetime, timedelta

try:
    import mysql.connector
    from mysql.connector import Error
except ImportError:
    print("mysql-connector-python n'est pas installe.")
    print("   Installez-le avec: pip install mysql-connector-python")
    sys.exit(1)

# -- Configuration --
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'bank_user'),
    'password': os.getenv('DB_PASSWORD', 'bank_password_dev'),
    'database': os.getenv('DB_NAME', 'banking_app'),
    'port': int(os.getenv('DB_PORT', 3306))
}

PEPPER = os.getenv('PASSWORD_PEPPER', 'super_secret_pepper_dev')

# -- Utilisateurs de test --
TEST_USERS = [
    {
        'username': 'alice',
        'email': 'alice@bank.com',
        'password': 'password123',
        'first_name': 'Alice',
        'last_name': 'Dupont',
        'balance': 2500.00,
        'account_type': 'user'
    },
    {
        'username': 'bob',
        'email': 'bob@bank.com',
        'password': 'password123',
        'first_name': 'Bob',
        'last_name': 'Martin',
        'balance': 1500.50,
        'account_type': 'user'
    },
    {
        'username': 'admin',
        'email': 'admin@bank.com',
        'password': 'adminpass123',
        'first_name': 'Admin',
        'last_name': 'User',
        'balance': 10000.00,
        'account_type': 'admin'
    }
]


def hash_password(password):
    """
    Hashe un mot de passe avec sel + poivre (meme logique que models/user.py).
    Format retourne : "sel_hex:hash_hex"
    """
    salt = os.urandom(32)
    peppered = password + PEPPER
    key = hashlib.pbkdf2_hmac('sha256', peppered.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + key.hex()


def connect_to_db():
    """Se connecte a MySQL avec retry automatique (utile dans Docker)."""
    max_retries = 10
    for attempt in range(max_retries):
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            print(f"Connecte a MySQL ({DB_CONFIG['host']}:{DB_CONFIG['port']})")
            return connection
        except Error as e:
            if attempt < max_retries - 1:
                print(f"MySQL pas encore pret (tentative {attempt + 1}/{max_retries})...")
                time.sleep(3)
            else:
                print(f"Impossible de se connecter a MySQL: {e}")
                sys.exit(1)

    # Jamais atteint, mais satisfait le linter
    sys.exit(1)


def seed_users(connection):
    """Insere les utilisateurs de test avec de vrais hash de mots de passe."""
    cursor = connection.cursor(dictionary=True)
    inserted: int = 0
    skipped: int = 0

    for user in TEST_USERS:
        # Verifier si l'utilisateur existe deja
        cursor.execute("SELECT id FROM users WHERE email = %s", (user['email'],))
        existing = cursor.fetchone()

        if existing:
            print(f"{user['username']} ({user['email']}) existe deja -> ignore")
            skipped = skipped + 1  # type: ignore
            continue

        # Hasher le mot de passe
        password_hash = hash_password(user['password'])

        # Inserer l'utilisateur
        cursor.execute(
            """INSERT INTO users (username, email, password_hash, first_name, last_name, balance, account_type)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (user['username'], user['email'], password_hash,
             user['first_name'], user['last_name'], user['balance'], user['account_type'])
        )
        print(f"{user['username']} ({user['email']}) cree avec succes")
        inserted = inserted + 1  # type: ignore

    connection.commit()
    cursor.close()

    print(f"\nSeed termine : {inserted} cree(s), {skipped} ignore(s)")
    print("Mots de passe de test :")
    for user in TEST_USERS:
        print(f"   - {user['email']} -> {user['password']}")

def seed_transactions(connection):
    """Genere des dizaines de virements aleatoires pour peupler l'historique."""
    cursor = connection.cursor(dictionary=True)
    
    # Recuperer les utilisateurs et categories
    cursor.execute("SELECT id, username FROM users")
    users = cursor.fetchall()
    
    cursor.execute("SELECT id, name FROM categories")
    categories = cursor.fetchall()
    
    if len(users) < 2 or len(categories) == 0:
        print(" Pas assez d'utilisateurs ou de categories pour generer des virements.")
        cursor.close()
        return

    # Verifier s'il y a deja beaucoup de virements
    cursor.execute("SELECT COUNT(*) as count FROM virements")
    if cursor.fetchone()['count'] > 5:
        print("\n Virements deja generes precedemment -> generation ignoree")
        cursor.close()
        return

    print("\n Generation de 50 transactions aleatoires dans le passe...")
    
    descriptions = {
        'Loisirs': ['Cinema', 'Restaurant entre amis', 'Concert', 'Abonnement Netflix', 'Jeux video'],
        'Électricité': ['Facture EDF', 'Regul electricite'],
        'Alimentation': ['Courses Carrefour', 'Boulangerie', 'Boucher', 'Marche au legumes'],
        'Salaire': ['Salaire', 'Prime exceptionnelle', 'Remboursement frais pro'],
        'Autre': ['Remboursement cadeau', 'Achat LeBonCoin', 'Don', 'Virement compte joint']
    }
    
    inserted_tx = 0
    now = datetime.now()
    
    for _ in range(50):
        sender = random.choice(users)
        receiver = random.choice(users)
        while receiver['id'] == sender['id']:
            receiver = random.choice(users)
            
        category = random.choice(categories)
        cat_name = category['name']
        
        # Si la categorie n'est pas dans le dico (ex: 'Loisirs' vs 'Entertainment'), on prend 'Autre'
        desc_list = descriptions.get(cat_name, descriptions['Autre'])
        description = random.choice(desc_list)
        
        # Montants logiques selon la categorie
        if cat_name == 'Salaire':
            amount = float(f"{random.uniform(1500, 3500):.2f}")
        elif cat_name == 'Alimentation':
            amount = float(f"{random.uniform(10, 150):.2f}")
        else:
            amount = float(f"{random.uniform(5, 200):.2f}")
            
        # Date aleatoire dans les 6 derniers mois
        days_ago = random.randint(1, 180)
        created_at = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        
        status = random.choice(['completed', 'completed', 'completed', 'pending'])
        executed_at = created_at + timedelta(hours=random.randint(1, 48)) if status == 'completed' else None
        
        # Reference unique basee sur timestamp et un random
        ref = f"VIR-{int(created_at.timestamp())}-{random.randint(100, 999)}"
        
        cursor.execute(
            """INSERT IGNORE INTO virements (sender_id, receiver_id, amount, category_id, description, reference_number, status, created_at, executed_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (sender['id'], receiver['id'], amount, category['id'], description, ref, status, created_at, executed_at)
        )
        inserted_tx += 1
        
    connection.commit()
    cursor.close()
    print(f" {inserted_tx} virements aleatoires generes avec succes !")

if __name__ == '__main__':
    conn = connect_to_db()
    seed_users(conn)
    seed_transactions(conn)
    conn.close()
