-- Update category table structure to align with current model

-- Rename 'reserved' column to 'locked' for consistency with the Java model
ALTER TABLE category RENAME COLUMN reserved TO locked;

-- Ensure all existing categories have proper locked status
UPDATE category SET locked = false WHERE locked IS NULL;