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
| `users` | Comptes utilisateurs | email, password_hash, balance, account_type, created_at, is_active |
| `categories` | Catégories de virements | name, icon_code, color_hex |
| `virements` | Historique des transferts | sender_id, receiver_id, amount, status |
| `notifications` | Notifications utilisateur | user_id, type, is_read |
| `audit_logs` | Journal des actions | user_id, action, details (JSON) |
| `banker_clients` | Relation banquier-client | banker_id, client_id |
| `messages` | Messagerie interne | sender_id, receiver_id, subject |
| `schema_migrations` | Suivi des migrations | migration_name, applied_at |

### `banker_clients`
Table de relation associant un banquier à son portefeuille de clients.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `INT` | `PK, AUTO_INCREMENT` |
| `banker_id` | `INT` | `NOT NULL, FK -> users.id (CASCADE)` |
| `client_id` | `INT` | `NOT NULL, UNIQUE, FK -> users.id (CASCADE)` |
| `assigned_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

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
           
users ──< notifications
virements >-- categories
users ──< banker_clients >── users
users ──< messages >── users

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
| `banker@bank.com` | `bankerpass123` | banker |

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

### `messages`
Système de messagerie interne permettant aux utilisateurs (notamment les banquiers et les clients) de s'envoyer des messages sécurisés.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `INT` | `PK, AUTO_INCREMENT` |
| `sender_id` | `INT` | `NOT NULL, FK -> users.id (CASCADE)` |
| `receiver_id` | `INT` | `NOT NULL, FK -> users.id (CASCADE)` |
| `subject` | `VARCHAR(255)` | `NOT NULL` |
| `body` | `TEXT` | `NOT NULL` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |
| `read_at` | `TIMESTAMP` | `NULL` |