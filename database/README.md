# API Contract

## Frontend expect du Backend :

### Auth
- `POST /auth/register` → `{username, email, password}` → `{user, token}`
- `POST /auth/login` → `{email, password}` → `{user, token}`

### Users
- `GET /users/<id>` → `{id, username, email, balance, ...}`

### Transfers
- `GET /transfers` (auth required) → `[{id, amount, ...}]`
- `POST /transfers` → crée virement

## Backend will be ready for Frontend on:
- ✅ Semaine 1 : Auth endpoints
- ✅ Semaine 2 : Transfers + Users endpoints
- ✅ Semaine 3 : Admin + Stats endpoints

## Frontend will deliver:
- ✅ Semaine 1 : Pages statiques + API service
- ✅ Semaine 2 : Login + Dashboard intégrés
- ✅ Semaine 3 : Tous les features