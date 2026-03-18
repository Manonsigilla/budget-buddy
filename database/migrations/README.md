# 📁 Migrations — Guide

## Structure

```
database/migrations/
├── 001_create_tables.sql         ← Tables de base (users, virements, audit_logs)
├── 002_add_notifications.sql     ← Table notifications
├── 003_add_categories.sql        ← Table categories + FK sur virements
└── README.md                     ← Ce fichier
```

## Convention de nommage

```
NNN_description_courte.sql
```

- `NNN` = numéro séquentiel sur 3 chiffres (001, 002, 003...)
- `description_courte` = ce que fait la migration en snake_case

## Créer une nouvelle migration

1. Créer le fichier SQL :
   ```
   database/migrations/004_add_ma_feature.sql
   ```

2. Écrire le SQL (toujours idempotent avec `IF NOT EXISTS` / `IF EXISTS`) :
   ```sql
   -- Migration 004: Description
   -- Date: YYYY-MM-DD
   -- Auteur: Ton nom

   ALTER TABLE ...;

   INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('004_add_ma_feature');
   ```

3. Ajouter le volume dans `docker-compose.yml` :
   ```yaml
   - ./database/migrations/004_add_ma_feature.sql:/docker-entrypoint-initdb.d/06-migration-004.sql
   ```

4. Mettre à jour `schema.sql` pour refléter l'état final du schéma

5. Commit + Push

## Appliquer les migrations

### Première installation (ou reset complet)
```bash
docker compose down -v && docker compose up --build
```
Les migrations s'exécutent automatiquement via `/docker-entrypoint-initdb.d/`.

### Vérifier les migrations appliquées
```bash
docker exec -it banking_app_db mysql -u bank_user -pbank_password_dev banking_app -e "SELECT * FROM schema_migrations;"
```

## Table schema_migrations

Chaque migration enregistre son nom dans `schema_migrations` :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT | Auto-increment |
| `migration_name` | VARCHAR(255) | Nom unique de la migration |
| `applied_at` | TIMESTAMP | Date d'application |

## ⚠️ Règles importantes

- **Ne jamais modifier** une migration déjà pushée → créer une nouvelle migration
- **Toujours** enregistrer la migration dans `schema_migrations`
- **Toujours** mettre à jour `schema.sql` pour refléter l'état final
- Écrire du SQL **idempotent** (`IF NOT EXISTS`, `INSERT IGNORE`, etc.)