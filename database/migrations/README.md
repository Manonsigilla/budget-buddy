<!-- Au quotidien :

Chacun fait ses changements de code (TypeScript/Python/SQL)
Si quelqu'un change le schéma DB → il crée une migration :

bash   # Créer: database/migrations/004_add_column.sql

Commit + Push
Les autres font git pull + docker-compose down && docker-compose up
Les migrations s'exécutent automatiquement 🎉 -->