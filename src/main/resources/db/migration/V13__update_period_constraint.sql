-- Update subscription period constraint to include new enum values
-- This fixes the constraint that was missed in V12

-- Drop the old constraint if it exists
ALTER TABLE subscription DROP CONSTRAINT IF EXISTS subscription_billing_period_check;

-- Add new constraint with all Period enum values including QUARTERLY and ONE_TIME
ALTER TABLE subscription ADD CONSTRAINT subscription_period_check 
    CHECK (period IN ('ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));