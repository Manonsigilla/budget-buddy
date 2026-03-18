-- Migration 002: Ajout de la table notifications
-- Date: 2026-03-18
-- Auteur: Database Team

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('transfer_sent', 'transfer_received', 'overdraft_alert', 'suspicious_activity') NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    related_transfer_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_transfer_id) REFERENCES virements(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- Enregistrement de la migration
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('002_add_notifications');
