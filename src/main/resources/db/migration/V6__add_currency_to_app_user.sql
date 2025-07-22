-- Add currency column to app_user table
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'USD';

-- Create index on currency for better performance
CREATE INDEX IF NOT EXISTS idx_app_user_currency ON app_user(currency); 