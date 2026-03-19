-- Migration 003: Ajout de la table catégories et lien avec virements
-- Date: 2026-03-18
-- Auteur: Database Team

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_code VARCHAR(20),
    color_hex VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajout de la colonne category_id sur virements si elle n'existe pas
-- Note : Dans le schema.sql initial, cette colonne est déjà présente.
-- Cette migration est utile si on applique les migrations séquentiellement.
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'virements'
      AND COLUMN_NAME = 'category_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE virements ADD COLUMN category_id INT, ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL',
    'SELECT "category_id already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Enregistrement de la migration
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('003_add_categories');
