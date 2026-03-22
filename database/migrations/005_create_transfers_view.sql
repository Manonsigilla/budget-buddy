-- Migration 005 : Création de la vue d'historique des virements
-- Responsable DB : Angie
--
-- Cette migration ajoute une "View" (fausse table) v_virements_details
-- qui fait automatiquement toutes les jointures entre les virements,
-- les utilisateurs (expéditeur et destinataire) et les catégories.

CREATE OR REPLACE VIEW v_virements_details AS
SELECT 
    v.id AS virement_id,
    v.amount,
    v.description,
    v.reference_number,
    v.status,
    v.created_at,
    v.executed_at,
    -- Informations sur l'expéditeur
    s.id AS sender_id,
    s.username AS sender_username,
    s.first_name AS sender_first_name,
    s.last_name AS sender_last_name,
    -- Informations sur le destinataire
    r.id AS receiver_id,
    r.username AS receiver_username,
    r.first_name AS receiver_first_name,
    r.last_name AS receiver_last_name,
    -- Informations sur la catégorie
    c.id AS category_id,
    c.name AS category_name,
    c.icon_code AS category_icon,
    c.color_hex AS category_color
FROM virements v
JOIN users s ON v.sender_id = s.id
JOIN users r ON v.receiver_id = r.id
LEFT JOIN categories c ON v.category_id = c.id;

-- Enregistrer la migration
INSERT IGNORE INTO schema_migrations (migration_name) VALUES ('005_create_transfers_view');
