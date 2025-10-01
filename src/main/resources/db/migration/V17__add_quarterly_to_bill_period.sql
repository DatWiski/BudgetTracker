-- Add QUARTERLY period to bill constraint
ALTER TABLE bill DROP CONSTRAINT chk_bill_period;

ALTER TABLE bill ADD CONSTRAINT chk_bill_period
CHECK (period IN ('MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY', 'ONE_TIME', 'QUARTERLY'));
