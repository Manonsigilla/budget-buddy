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
│   │   └── auth.py         ← POST /auth/register, POST /auth/login
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

### Exemples

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

---

## 🗃️ Base de données

Tables MySQL disponibles :
- `users` — comptes utilisateurs
- `categories` — catégories de virements
- `virements` — historique des transactions
- `notifications` — notifications utilisateur
- `audit_logs` — journal des actions

---

## 👥 Équipe

- Frontend: Toi
- Backend: Collègue #1
- Database: Collègue #2
