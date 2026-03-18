# 🗃️ Database — Budget Buddy

## API Contract

### Frontend attend du Backend :

#### Auth
- `POST /auth/register` → `{username, email, password, first_name, last_name}` → `{user_id, message}`
- `POST /auth/login` → `{email, password}` → `{user, token}`

#### Users
- `GET /users/<id>` → `{id, username, email, balance, ...}`

#### Transfers
- `GET /transfers` (auth required) → `[{id, amount, ...}]`
- `POST /transfers` → crée un virement

---

## Schéma de la base de données

### Tables

| Table | Description | Lignes clés |
|-------|-------------|-------------|
| `users` | Comptes utilisateurs | email, password_hash, balance |
| `categories` | Catégories de virements | name, icon_code, color_hex |
| `virements` | Historique des transferts | sender_id, receiver_id, amount, status |
| `notifications` | Notifications utilisateur | user_id, type, is_read |
| `audit_logs` | Journal des actions | user_id, action, details (JSON) |
| `schema_migrations` | Suivi des migrations | migration_name, applied_at |

### Contraintes de sécurité

- `CHECK (balance >= 0)` — empêche les soldes négatifs
- `CHECK (amount > 0)` — montant de virement toujours positif
- `CHECK (sender_id != receiver_id)` — pas de virement à soi-même
- Mots de passe hashés avec `pbkdf2_hmac` + sel + poivre

### Diagramme des relations

```
users ──< virements >── users
           │
           └── categories
           
users ──< notifications >── virements

users ──< audit_logs
```

---

## Seeding (données de test)

### Catégories et virements
Insérés automatiquement via `seed.sql` au premier démarrage Docker.

### Utilisateurs de test
Créés via le script Python `seed_users.py` (hash réels) :

```bash
docker exec -it banking_app_api python /database/seed_users.py
```

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `alice@bank.com` | `password123` | user |
| `bob@bank.com` | `password123` | user |
| `admin@bank.com` | `adminpass123` | admin |

---

## Planning

### Backend will be ready for Frontend on :
- ✅ Semaine 1 : Auth endpoints
- ✅ Semaine 2 : Transfers + Users endpoints
- ✅ Semaine 3 : Admin + Stats endpoints

### Frontend will deliver :
- ✅ Semaine 1 : Pages statiques + API service
- ✅ Semaine 2 : Login + Dashboard intégrés
- ✅ Semaine 3 : Tous les features