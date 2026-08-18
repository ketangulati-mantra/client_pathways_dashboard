-- ==============================================================================
-- Neon PostgreSQL Database Schema for User Pathways Platform
-- ==============================================================================

-- 1. Automatic Timestamp Update Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    service VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    is_reviewer BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    allowed_pages JSONB DEFAULT '["lessons", "users"]'::jsonb,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
