-- Add refresh token table for secure token management
CREATE TABLE refresh_token (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    app_user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45),
    FOREIGN KEY (app_user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_refresh_token_hash ON refresh_token(token_hash);
CREATE INDEX idx_refresh_token_user ON refresh_token(app_user_id);
CREATE INDEX idx_refresh_token_expires ON refresh_token(expires_at);

-- Create compound index for user and expiry queries
CREATE INDEX idx_refresh_token_user_expires ON refresh_token(app_user_id, expires_at);