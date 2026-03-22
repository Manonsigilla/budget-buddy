-- Migration 004 : Ajout du rôle banquier et de la table banker_clients
-- Responsable DB : Angie
-- Responsable Backend : Louis

-- Étape 1 : Ajouter le rôle 'banker' dans l'enum account_type
ALTER TABLE users MODIFY COLUMN account_type ENUM('user', 'admin', 'banker') DEFAULT 'user';

-- Étape 2 : Créer la table de relation banquier-client
CREATE TABLE IF NOT EXISTS banker_clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banker_id INT NOT NULL,
    client_id INT NOT NULL UNIQUE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_banker (banker_id)
);

-- Étape 3 : Enregistrer la migration dans schema_migrations
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('004_add_banker_role');
