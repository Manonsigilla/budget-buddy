from utils.db import get_db_connection
from datetime import datetime

def create_message(sender_id, receiver_id, subject, body):
    """
    Crée un nouveau message.
    Retourne l'ID du message créé, ou None en cas d'erreur.
    """
    db = get_db_connection()
    if not db:
        return None

    try:
        cursor = db.cursor()
        cursor.execute(
            """INSERT INTO messages (sender_id, receiver_id, subject, body, created_at)
               VALUES (%s, %s, %s, %s, NOW())""",
            (sender_id, receiver_id, subject, body)
        )
        db.commit()
        message_id = cursor.lastrowid
        cursor.close()
        db.close()
        return message_id
    except Exception as e:
        print(f"Erreur création message: {e}")
        db.rollback()
        cursor.close()
        db.close()
        return None


def get_messages_inbox(user_id):
    """
    Récupère les messages reçus par un utilisateur.
    Retourne une liste de messages ordonnés par date décroissante.
    """
    db = get_db_connection()
    if not db:
        return []

    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            """SELECT m.id, m.sender_id, m.receiver_id, m.subject, m.body, 
                      m.created_at, m.read_at,
                      u.first_name, u.last_name, u.email
               FROM messages m
               JOIN users u ON m.sender_id = u.id
               WHERE m.receiver_id = %s
               ORDER BY m.created_at DESC""",
            (user_id,)
        )
        messages = cursor.fetchall()
        cursor.close()
        db.close()
        return messages
    except Exception as e:
        print(f"Erreur récupération messages: {e}")
        cursor.close()
        db.close()
        return []


def get_messages_sent(user_id):
    """
    Récupère les messages envoyés par un utilisateur.
    Retourne une liste de messages ordonnés par date décroissante.
    """
    db = get_db_connection()
    if not db:
        return []

    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            """SELECT m.id, m.sender_id, m.receiver_id, m.subject, m.body, 
                      m.created_at, m.read_at,
                      u.first_name, u.last_name, u.email
               FROM messages m
               JOIN users u ON m.receiver_id = u.id
               WHERE m.sender_id = %s
               ORDER BY m.created_at DESC""",
            (user_id,)
        )
        messages = cursor.fetchall()
        cursor.close()
        db.close()
        return messages
    except Exception as e:
        print(f"Erreur récupération messages envoyés: {e}")
        cursor.close()
        db.close()
        return []


def mark_message_as_read(message_id, user_id):
    """
    Marque un message comme lu.
    Retourne True si succès, False sinon.
    """
    db = get_db_connection()
    if not db:
        return False

    try:
        cursor = db.cursor()
        cursor.execute(
            """UPDATE messages SET read_at = NOW() 
               WHERE id = %s AND receiver_id = %s""",
            (message_id, user_id)
        )
        db.commit()
        cursor.close()
        db.close()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Erreur marquage message: {e}")
        db.rollback()
        cursor.close()
        db.close()
        return False


def delete_message(message_id, user_id):
    """
    Supprime un message (seulement si l'utilisateur en est l'auteur ou le destinataire).
    Retourne True si succès, False sinon.
    """
    db = get_db_connection()
    if not db:
        return False

    try:
        cursor = db.cursor()
        cursor.execute(
            """DELETE FROM messages WHERE id = %s AND (sender_id = %s OR receiver_id = %s)""",
            (message_id, user_id, user_id)
        )
        db.commit()
        cursor.close()
        db.close()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Erreur suppression message: {e}")
        db.rollback()
        cursor.close()
        db.close()
        return False