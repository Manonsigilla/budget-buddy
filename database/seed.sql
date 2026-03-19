-- database/seed.sql
-- Données de test pour le développement
-- Note : Les utilisateurs sont créés via seed_users.py (hash réels)

-- Catégories de virements
INSERT IGNORE INTO categories (name, icon_code, color_hex) VALUES
('Loisirs', 'entertainment', '#FF6B6B'),
('Électricité', 'lightning', '#FFD93D'),
('Alimentation', 'shopping-cart', '#6BCB77'),
('Salaire', 'briefcase', '#4D96FF'),
('Autre', 'help-circle', '#999999');

-- Virements de test (seront insérés après les users par seed_users.py)
-- Ces virements sont insérés ici seulement si les users existent déjà
INSERT IGNORE INTO virements (sender_id, receiver_id, amount, category_id, description, reference_number, status)
SELECT 1, 2, 150.00, 1, 'Remboursement cinéma', 'VIR-001', 'completed'
FROM users WHERE id = 1 AND EXISTS (SELECT 1 FROM users WHERE id = 2)
LIMIT 1;

INSERT IGNORE INTO virements (sender_id, receiver_id, amount, category_id, description, reference_number, status)
SELECT 2, 1, 50.00, 3, 'Partage courses', 'VIR-002', 'completed'
FROM users WHERE id = 2 AND EXISTS (SELECT 1 FROM users WHERE id = 1)
LIMIT 1;