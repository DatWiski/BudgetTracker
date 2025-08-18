-- Create income table
CREATE TABLE income (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    income_date DATE NOT NULL,
    description VARCHAR(500),
    category_id BIGINT,
    app_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (app_user_id) REFERENCES app_user(id)
);

-- Create indexes for performance
CREATE INDEX idx_income_user ON income(app_user_id);
CREATE INDEX idx_income_date ON income(income_date);
CREATE INDEX idx_income_category ON income(category_id);

-- Add default income categories
INSERT INTO category (name, locked, app_user_id) 
SELECT 'Job Salary', true, id FROM app_user 
WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Job Salary' AND app_user_id = app_user.id);

INSERT INTO category (name, locked, app_user_id) 
SELECT 'Freelance', true, id FROM app_user 
WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Freelance' AND app_user_id = app_user.id);

INSERT INTO category (name, locked, app_user_id) 
SELECT 'Dividends', true, id FROM app_user 
WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Dividends' AND app_user_id = app_user.id);

INSERT INTO category (name, locked, app_user_id) 
SELECT 'Other Income', true, id FROM app_user 
WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Other Income' AND app_user_id = app_user.id);