-- Add default categories for all existing users

-- Insert default categories if they don't exist
INSERT INTO category (app_user_id, name, color, locked)
SELECT au.id, 'Entertainment', '#FF6B6B', FALSE
FROM app_user au
WHERE NOT EXISTS (
    SELECT 1 FROM category c 
    WHERE c.app_user_id = au.id AND c.name = 'Entertainment'
);

INSERT INTO category (app_user_id, name, color, locked)  
SELECT au.id, 'Productivity', '#4ECDC4', FALSE
FROM app_user au
WHERE NOT EXISTS (
    SELECT 1 FROM category c 
    WHERE c.app_user_id = au.id AND c.name = 'Productivity'
);

INSERT INTO category (app_user_id, name, color, locked)
SELECT au.id, 'Utilities', '#45B7D1', FALSE  
FROM app_user au
WHERE NOT EXISTS (
    SELECT 1 FROM category c 
    WHERE c.app_user_id = au.id AND c.name = 'Utilities'
);

INSERT INTO category (app_user_id, name, color, locked)
SELECT au.id, 'Education', '#96CEB4', FALSE
FROM app_user au  
WHERE NOT EXISTS (
    SELECT 1 FROM category c 
    WHERE c.app_user_id = au.id AND c.name = 'Education'
);

INSERT INTO category (app_user_id, name, color, locked)
SELECT au.id, 'Fitness', '#FFEAA7', FALSE
FROM app_user au
WHERE NOT EXISTS (
    SELECT 1 FROM category c 
    WHERE c.app_user_id = au.id AND c.name = 'Fitness'
);