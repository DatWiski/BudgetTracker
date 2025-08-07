-- Add unique constraint for category name per user
-- This ensures users cannot have duplicate category names

ALTER TABLE category 
ADD CONSTRAINT uk_category_user_name UNIQUE (app_user_id, name);

-- Update category table to ensure proper data integrity
UPDATE category SET color = '#808080' WHERE color IS NULL OR color = '';