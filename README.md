# 🏦 Banking App - Budget Buddy

## 🚀 Démarrage rapide

### Prérequis
- Docker Desktop installé

### Installation
```bash
git clone <url>
cd budget-buddy
docker compose down -v && docker compose up --build
```

### Accès

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Database: localhost:3307 (user: bank_user)

### Vérification
```bash
curl http://localhost:5001/health
```

Doit retourner : `{"status": "ok", "database": "ok", "timestamp": "..."}`

---

## 📁 Structure du projet

```
budget-buddy/
├── backend/
│   ├── app.py              ← Point d'entrée Flask
│   ├── config.py           ← Configuration (DB, env)
│   ├── requirements.txt    ← Dépendances Python
│   ├── Dockerfile
│   ├── models/
│   │   └── user.py         ← Fonctions liées aux utilisateurs (DB)
│   ├── routes/
│   │   ├── health.py       ← GET /health
│   │   ├── auth.py         ← POST /auth/register, POST /auth/login
│   │   └── users.py        ← GET/PUT /users/me, PUT /users/me/password
│   └── utils/
│       └── db.py           ← Connexion MySQL
├── frontend/               ← React/TypeScript (en cours)
├── database/
│   ├── schema.sql          ← Structure des tables MySQL
│   └── seed.sql            ← Données de test
└── docker-compose.yml
```

---

## 🔌 Routes API disponibles

### Santé
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Vérifie que l'API et la DB tournent |

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Se connecter, reçoit un token JWT |

#### Règles de validation
- Tous les champs sont requis : `username`, `email`, `password`, `first_name`, `last_name`
- Email doit être au format valide (ex: `alice@test.com`)
- Mot de passe minimum **8 caractères**

**Register :**
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@test.com", "password": "motdepasse", "first_name": "Alice", "last_name": "Dupont"}'
```

**Login :**
```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@test.com", "password": "motdepasse"}'
```

### Utilisateurs (protégé par JWT)

> Toutes ces routes nécessitent le header : `Authorization: Bearer <token>`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users/me` | Récupérer son profil et son solde |
| PUT | `/users/me` | Modifier son profil (nom, email, username) |
| PUT | `/users/me/password` | Changer son mot de passe |

**Récupérer son profil :**
```bash
curl -H "Authorization: Bearer TON_TOKEN" \
  http://localhost:5001/users/me
```

**Modifier son profil :**
```bash
curl -X PUT http://localhost:5001/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN" \
  -d '{"first_name": "Louis", "last_name": "Martin"}'
```

**Changer son mot de passe :**
```bash
curl -X PUT http://localhost:5001/users/me/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN" \
  -d '{"old_password": "ancien123", "new_password": "nouveau123"}'
```

---

## 🔐 Sécurité des mots de passe

Les mots de passe ne sont **jamais stockés en clair** dans la base de données. On utilise trois mécanismes combinés avec la librairie Python intégrée `hashlib` :

### 1. Hashage (hashlib)

Le mot de passe est transformé en une chaîne illisible grâce à `pbkdf2_hmac` (SHA-256). C'est une fonction à **sens unique** — impossible de retrouver le mot de passe original à partir du hash.

```
"motdepasse" → "a3f8c2d9e1b7..." (stocké en DB)
```

### 2. Sel (`os.urandom(32)`)

Une valeur aléatoire unique est générée à chaque inscription et ajoutée au mot de passe avant de le hacher. Résultat : deux utilisateurs avec le même mot de passe auront des hashs **différents** en base de données.

```
"motdepasse" + sel_aléatoire_1 → "a3f8c2d9..."
"motdepasse" + sel_aléatoire_2 → "x9k2m7p1..."  ← hash différent !
```

Le sel est stocké en base de données avec le hash (format `sel:hash`).

### 3. Poivre (`PASSWORD_PEPPER`)

Une valeur secrète fixe stockée dans les **variables d'environnement Docker** — jamais en base de données. Si un hacker vole la base de données MySQL, il a les sels mais pas le poivre → il ne peut pas reconstruire les hashs.

```
"motdepasse" + poivre → + sel → hash final
```

### En résumé

```python
# Inscription
peppered = password + PEPPER          # ajout du poivre
salt = os.urandom(32)                 # sel aléatoire unique
key = hashlib.pbkdf2_hmac(...)        # hashage SHA-256
stocké en DB → "salt_hex:key_hex"

# Connexion
# on relit le sel depuis la DB
# on refait le même calcul avec le poivre
# on compare les deux hashs
```

---

## 🔑 Variables d'environnement

Toutes les valeurs sensibles sont dans le `docker-compose.yml` sous forme de variables d'environnement — jamais dans le code source.

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Hôte MySQL |
| `DB_USER` | Utilisateur MySQL |
| `DB_PASSWORD` | Mot de passe MySQL |
| `DB_NAME` | Nom de la base de données |
| `PASSWORD_PEPPER` | Poivre pour le hashage des mots de passe |
| `SECRET_KEY` | Clé secrète Flask |
| `JWT_SECRET_KEY` | Clé secrète pour les tokens JWT |

---

## 🛠️ Commandes utiles

### Docker

```bash
# Lancer le projet (première fois ou après un changement de code)
docker compose up --build

# Lancer le projet (sans rebuild)
docker compose up

# Arrêter le projet
docker compose down

# Arrêter et supprimer les données MySQL (repart de zéro)
docker compose down -v

# Voir les logs en temps réel
docker compose logs -f

# Voir les logs d'un seul conteneur
docker compose logs -f backend
docker compose logs -f mysql
docker compose logs -f frontend
```

### Base de données

```bash
# Ouvrir MySQL dans le terminal
docker exec -it banking_app_db mysql -u bank_user -pbank_password_dev banking_app

# Voir tous les utilisateurs
docker exec -it banking_app_db mysql -u bank_user -pbank_password_dev banking_app -e "SELECT id, username, email, balance FROM users;"

# Voir tous les virements
docker exec -it banking_app_db mysql -u bank_user -pbank_password_dev banking_app -e "SELECT * FROM virements;"
```

### Tester l'API

```bash
# Vérifier que l'API tourne
curl http://localhost:5001/health

# Créer un compte
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@test.com", "password": "motdepasse", "first_name": "Alice", "last_name": "Dupont"}'

# Se connecter
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@test.com", "password": "motdepasse"}'
```

---

## 🗃️ Base de données

Tables MySQL disponibles :

- `users` — comptes utilisateurs
- `categories` — catégories de virements
- `virements` — historique des transactions
- `notifications` — notifications utilisateur
- `audit_logs` — journal des actions

---

## Frontend React/TypeScript :

- AuthContext : gestion de l'état d'authentification
- Login : formulaire de connexion
- Register : formulaire d'inscription
- API intégrée avec le backend Flask pour l'inscription et la connexion

## 👥 Équipe

- Frontend: Manon
- Backend: Louis
- Database: Angie
