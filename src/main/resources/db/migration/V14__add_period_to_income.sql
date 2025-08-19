-- Add period column to income table for dashboard graph projections
ALTER TABLE income ADD COLUMN period VARCHAR(20) DEFAULT 'ONE_TIME';

-- Make period not null after setting default
ALTER TABLE income ALTER COLUMN period SET NOT NULL;

-- Add constraint for valid period values
ALTER TABLE income ADD CONSTRAINT income_period_check 
    CHECK (period IN ('ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));

-- Add index for period filtering
CREATE INDEX idx_income_period ON income(period);