ALTER TABLE users ADD COLUMN account_type ENUM('user', 'admin', 'banker') DEFAULT 'user';

CREATE TABLE IF NOT EXISTS banker_clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banker_id INT NOT NULL,
    client_id INT NOT NULL UNIQUE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (banker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_banker (banker_id)
);
