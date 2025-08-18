-- Add category type to distinguish between income and subscription categories
ALTER TABLE category ADD COLUMN category_type VARCHAR(20) DEFAULT 'SUBSCRIPTION';

-- Update existing categories to have correct types
UPDATE category SET category_type = 'INCOME' 
WHERE name IN ('Job Salary', 'Freelance', 'Dividends', 'Other Income');

-- Make category_type not null after setting defaults
ALTER TABLE category ALTER COLUMN category_type SET NOT NULL;

-- Add index for category type filtering
CREATE INDEX idx_category_type ON category(category_type);