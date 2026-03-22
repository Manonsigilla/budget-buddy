# Modèle virement — fonctions d'accès à la table `virements` en base de données.
# Gère aussi la mise à jour des soldes et la création des notifications associées.

import uuid
from utils.db import get_db_connection


def generate_reference():
    """Génère un numéro de référence unique pour chaque virement (ex: VIR-A1B2C3D4)."""
    return "VIR-" + uuid.uuid4().hex[:8].upper()


def create_virement(sender_id, receiver_id, amount, description=None, category_id=None):
    """
    Effectue un virement entre deux utilisateurs.
    - Vérifie que le solde de l'expéditeur est suffisant
    - Débite l'expéditeur et crédite le destinataire
    - Crée une notification pour les deux utilisateurs
    Retourne le virement créé ou une erreur.
    """
    db = get_db_connection()
    if not db:
        return None, "Erreur de connexion à la base de données"

    cursor = db.cursor(dictionary=True)

    # Vérifier que l'expéditeur a suffisamment de fonds
    cursor.execute("SELECT balance, first_name, last_name FROM users WHERE id = %s", (sender_id,))
    sender = cursor.fetchone()
    if not sender:
        cursor.close()
        db.close()
        return None, "Expéditeur non trouvé"

    if float(sender['balance']) < float(amount):
        cursor.close()
        db.close()
        return None, "Solde insuffisant"

    # Vérifier que le destinataire existe
    cursor.execute("SELECT id, first_name, last_name FROM users WHERE id = %s", (receiver_id,))
    receiver = cursor.fetchone()
    if not receiver:
        cursor.close()
        db.close()
        return None, "Destinataire non trouvé"

    reference = generate_reference()

    try:
        # Débiter l'expéditeur
        cursor.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (amount, sender_id))

        # Créditer le destinataire
        cursor.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (amount, receiver_id))

        # Créer le virement
        cursor.execute(
            """INSERT INTO virements (sender_id, receiver_id, amount, description, category_id, reference_number, status, executed_at)
               VALUES (%s, %s, %s, %s, %s, %s, 'completed', NOW())""",
            (sender_id, receiver_id, amount, description, category_id, reference)
        )
        virement_id = cursor.lastrowid

        # Notification pour l'expéditeur
        cursor.execute(
            """INSERT INTO notifications (user_id, type, title, message, related_transfer_id)
               VALUES (%s, 'transfer_sent', %s, %s, %s)""",
            (
                sender_id,
                "Virement envoyé",
                f"Vous avez envoyé {amount}€ à {receiver['first_name']} {receiver['last_name']} (réf: {reference})",
                virement_id
            )
        )

        # Notification pour le destinataire
        cursor.execute(
            """INSERT INTO notifications (user_id, type, title, message, related_transfer_id)
               VALUES (%s, 'transfer_received', %s, %s, %s)""",
            (
                receiver_id,
                "Virement reçu",
                f"Vous avez reçu {amount}€ de {sender['first_name']} {sender['last_name']} (réf: {reference})",
                virement_id
            )
        )

        # Vérifier le solde restant de l'expéditeur après le virement
        # Si le solde passe sous 100€, on crée une alerte de découvert
        new_balance = float(sender['balance']) - float(amount)
        SEUIL_ALERTE = 100.0

        if new_balance < SEUIL_ALERTE:
            cursor.execute(
                """INSERT INTO notifications (user_id, type, title, message, related_transfer_id)
                   VALUES (%s, 'overdraft_alert', %s, %s, %s)""",
                (
                    sender_id,
                    "Solde faible",
                    f"Attention, votre solde est passé sous {SEUIL_ALERTE}€. Solde actuel : {new_balance:.2f}€",
                    virement_id
                )
            )

        db.commit()
        cursor.close()
        db.close()
        return {"id": virement_id, "reference": reference, "status": "completed", "new_balance": new_balance}, None

    except Exception as e:
        db.rollback()
        cursor.close()
        db.close()
        return None, str(e)


def get_virements_by_user(user_id, filters=None):
    """
    Récupère l'historique des virements d'un utilisateur avec filtres optionnels.

    Filtres disponibles (dict) :
    - date       : transactions d'une date précise (ex: "2026-03-22")
    - date_start : date de début (ex: "2026-01-01")
    - date_end   : date de fin   (ex: "2026-03-22")
    - category_id: filtre par catégorie
    - type       : "sent" (envoyés) ou "received" (reçus)
    - sort       : "asc" ou "desc" par montant (défaut: date DESC)
    """
    db = get_db_connection()
    if not db:
        return []

    if filters is None:
        filters = {}

    # Construction de la requête avec filtres dynamiques
    query = """SELECT v.id, v.amount, v.description, v.reference_number, v.status, v.created_at,
                      v.category_id,
                      s.id as sender_id, s.first_name as sender_first, s.last_name as sender_last,
                      r.id as receiver_id, r.first_name as receiver_first, r.last_name as receiver_last
               FROM virements v
               JOIN users s ON v.sender_id = s.id
               JOIN users r ON v.receiver_id = r.id
               WHERE """

    params = []

    # Filtre par type (envoyé ou reçu)
    type_filter = filters.get('type')
    if type_filter == 'sent':
        query += "v.sender_id = %s"
        params.append(user_id)
    elif type_filter == 'received':
        query += "v.receiver_id = %s"
        params.append(user_id)
    else:
        query += "(v.sender_id = %s OR v.receiver_id = %s)"
        params.extend([user_id, user_id])

    # Filtre par date précise
    if filters.get('date'):
        query += " AND DATE(v.created_at) = %s"
        params.append(filters['date'])

    # Filtre par plage de dates
    if filters.get('date_start'):
        query += " AND DATE(v.created_at) >= %s"
        params.append(filters['date_start'])
    if filters.get('date_end'):
        query += " AND DATE(v.created_at) <= %s"
        params.append(filters['date_end'])

    # Filtre par catégorie
    if filters.get('category_id'):
        query += " AND v.category_id = %s"
        params.append(filters['category_id'])

    # Tri par montant ou par date
    sort = (filters.get('sort') or '').lower()
    if sort == 'asc':
        query += " ORDER BY v.amount ASC"
    elif sort == 'desc':
        query += " ORDER BY v.amount DESC"
    else:
        query += " ORDER BY v.created_at DESC"

    cursor = db.cursor(dictionary=True)
    cursor.execute(query, params)
    virements = cursor.fetchall()
    cursor.close()
    db.close()

    # Convertir les types non sérialisables en JSON
    for v in virements:
        v['amount'] = float(v['amount'])
        v['created_at'] = str(v['created_at'])

    return virements
