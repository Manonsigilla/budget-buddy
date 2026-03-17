-- database/seed.sql
INSERT INTO users (username, email, password_hash, first_name, last_name, balance, account_type) VALUES
('alice', 'alice@bank.com', 'hashed_pwd_1', 'Alice', 'Dupont', 2500.00, 'user'),
('bob', 'bob@bank.com', 'hashed_pwd_2', 'Bob', 'Martin', 1500.50, 'user'),
('admin', 'admin@bank.com', 'hashed_pwd_admin', 'Admin', 'User', 10000.00, 'admin');

INSERT INTO categories (name, icon_code, color_hex) VALUES
('Loisirs', 'entertainment', '#FF6B6B'),
('Électricité', 'lightning', '#FFD93D'),
('Alimentation', 'shopping-cart', '#6BCB77'),
('Salaire', 'briefcase', '#4D96FF'),
('Autre', 'help-circle', '#999999');

INSERT INTO virements (sender_id, receiver_id, amount, category_id, description, reference_number, status) VALUES
(1, 2, 150.00, 1, 'Remboursement cinéma', 'VIR-001', 'completed'),
(2, 1, 50.00, 3, 'Partage courses', 'VIR-002', 'completed');