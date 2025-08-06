-- Add locked column default false
ALTER TABLE category ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE;

-- Inserts a locked "Subscriptions" category for each user if absent
INSERT INTO category (app_user_id, name, color, locked)
SELECT au.id, 'Subscriptions', '#9ca3af', TRUE
FROM app_user au
WHERE NOT EXISTS (
    SELECT 1 FROM category c
    WHERE c.app_user_id = au.id AND lower(c.name) = 'subscriptions'
); 