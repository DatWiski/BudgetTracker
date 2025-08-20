-- Create bill table
CREATE TABLE bill (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2),
    period VARCHAR(50),
    due_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category_id BIGINT,
    app_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (app_user_id) REFERENCES app_user(id)
);

-- Create indexes for better performance
CREATE INDEX idx_bill_user ON bill(app_user_id);
CREATE INDEX idx_bill_due_date ON bill(due_date);
CREATE INDEX idx_bill_active ON bill(is_active);

-- Add constraint for period values (same as subscription)
ALTER TABLE bill ADD CONSTRAINT chk_bill_period 
CHECK (period IN ('MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY', 'ONE_TIME'));