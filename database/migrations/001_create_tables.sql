-- Migration 001: Création des tables de base (users, virements, audit_logs)
-- Date: 2026-03-18
-- Auteur: Database Team

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    balance DECIMAL(15, 2) DEFAULT 0,
    account_type ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username),
    CONSTRAINT chk_balance_positive CHECK (balance >= 0)
);

-- Table des virements (transferts entre utilisateurs)
CREATE TABLE IF NOT EXISTS virements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    reference_number VARCHAR(20) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_sender_not_receiver CHECK (sender_id != receiver_id)
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Enregistrement de la migration
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('001_create_tables');
