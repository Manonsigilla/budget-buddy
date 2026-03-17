# 🏦 Banking App - Budget Buddy

## 🚀 Démarrage rapide

### Prérequis
- Docker Desktop installé

### Installation
```bash
git clone <url>
cd budget-buddy
docker compose up --build
```

### Accès

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:3306 (user: bank_user)

### Vérification
```bash
curl http://localhost:5000/health
```

Doit retourner : `{"status":"ok",...}`

## 📁 Structure
```
budget-buddy/
├── backend/       (Python/Flask API)
├── frontend/      (React/TypeScript UI)
├── database/      (MySQL schema)
└── docker-compose.yml
```

## 👥 Équipe

- Frontend: Toi
- Backend: Collègue #1
- Database: Collègue #2
