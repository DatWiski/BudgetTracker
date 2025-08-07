-- Improve indexing strategy for better query performance

-- Remove old index and create better one for category name search
DROP INDEX IF EXISTS idx_category_name_user;
CREATE INDEX idx_category_name ON category(name);

-- Add index for subscription search by name
CREATE INDEX idx_subscription_name ON subscription(name);

-- Add composite index for active subscriptions by user
CREATE INDEX idx_subscription_user_active ON subscription(app_user_id, is_active);