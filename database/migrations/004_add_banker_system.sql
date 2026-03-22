-- Migration 004 : Ajout du rôle banquier et de la table banker_clients
-- Responsable DB : Angie
-- Responsable Backend : Louis
--
-- Cette migration ajoute :
-- 1. Le rôle 'banker' dans la colonne account_type de la table users
-- 2. La table banker_clients pour gérer les relations banquier-client

-- Étape 1 : Ajouter le rôle 'banker' dans l'enum account_type
ALTER TABLE users
MODIFY COLUMN account_type ENUM('user', 'admin', 'banker') NOT NULL DEFAULT 'user';

-- Étape 2 : Créer la table de relation banquier-client
CREATE TABLE IF NOT EXISTS banker_clients (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    banker_id     INT NOT NULL,
    client_id     INT NOT NULL,
    assigned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Un banquier ne peut pas gérer le même client deux fois
    UNIQUE KEY unique_banker_client (banker_id, client_id),

    FOREIGN KEY (banker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Étape 3 : Enregistrer la migration dans schema_migrations
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('004_add_banker_system');
