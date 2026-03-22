-- Migration 006 : Création de la table messages (Messagerie interne)
-- Responsable DB : Angie
--
-- Cette migration ajoute la table `messages` pour permettre aux utilisateurs
-- de s'envoyer des messages en interne.

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id)
);

-- Enregistrer la migration dans schema_migrations
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('006_create_messages_table');
