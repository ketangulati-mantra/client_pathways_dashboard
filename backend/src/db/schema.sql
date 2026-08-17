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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Generic Activity Submissions Table
CREATE TABLE IF NOT EXISTS activity_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    service VARCHAR(50),
    lesson_id VARCHAR(100) NOT NULL,
    activity_title VARCHAR(255) NOT NULL,
    submission_type VARCHAR(100) NOT NULL,
    form_data JSONB DEFAULT '{}'::jsonb,
    submission_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'pending',
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
