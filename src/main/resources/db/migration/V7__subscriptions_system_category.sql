-- Inserts a locked "Subscriptions" category for each user if absent
-- Note: locked column was added in V4
INSERT INTO category (app_user_id, name, color, locked)
SELECT au.id, 'Subscriptions', '#9ca3af', TRUE
FROM app_user au
WHERE NOT EXISTS (
    SELECT 1 FROM category c
    WHERE c.app_user_id = au.id AND lower(c.name) = 'subscriptions'
); 