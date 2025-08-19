-- Rename billingPeriod column to period in subscription table
-- and update enum values to include new options
ALTER TABLE subscription RENAME COLUMN billing_period TO period;

-- Update existing enum values to match new Period enum
-- BillingPeriod.DAILY -> Period.DAILY (no change)
-- BillingPeriod.WEEKLY -> Period.WEEKLY (no change)
-- BillingPeriod.MONTHLY -> Period.MONTHLY (no change)
-- BillingPeriod.YEARLY -> Period.YEARLY (no change)

-- Note: ONE_TIME and QUARTERLY are new options that will be available
-- but existing subscriptions will keep their current period values