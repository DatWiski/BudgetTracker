-- Create app_user table
CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    google_sub VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    picture_url VARCHAR(255)
);

-- Create category table
CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#808080',
    reserved BOOLEAN NOT NULL DEFAULT false,
    app_user_id BIGINT NOT NULL,
    FOREIGN KEY (app_user_id) REFERENCES app_user(id)
);

-- Create subscription table
CREATE TABLE subscription (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2),
    billing_period VARCHAR(50),
    next_billing_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category_id BIGINT,
    app_user_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (app_user_id) REFERENCES app_user(id)
);

-- Create indexes for better performance
CREATE INDEX idx_app_user_google_sub ON app_user(google_sub);
CREATE INDEX idx_subscription_user ON subscription(app_user_id);
CREATE INDEX idx_subscription_next_billing ON subscription(next_billing_date);
CREATE INDEX idx_subscription_active ON subscription(is_active);
CREATE INDEX idx_category_user ON category(app_user_id);
CREATE INDEX idx_category_name_user ON category(name, app_user_id); 