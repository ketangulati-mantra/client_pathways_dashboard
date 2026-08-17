-- ==============================================================================
-- Neon PostgreSQL Database Schema for Provider Pathways Platform
-- All tables include user_id tracking and created_at / updated_at timestamps.
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for users
DROP TRIGGER IF EXISTS set_users_timestamp ON users;
CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 3. Lesson Completions Table
CREATE TABLE IF NOT EXISTS lesson_completions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    service VARCHAR(50) NOT NULL,
    lesson_id VARCHAR(100) NOT NULL,
    reward_points INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);

-- Trigger for lesson_completions
DROP TRIGGER IF EXISTS set_lesson_completions_timestamp ON lesson_completions;
CREATE TRIGGER set_lesson_completions_timestamp
BEFORE UPDATE ON lesson_completions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. User Progress Checkpoints Table
CREATE TABLE IF NOT EXISTS user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(100) NOT NULL,
    progress_percent INT DEFAULT 0,
    video_watched BOOLEAN DEFAULT FALSE,
    quiz_done BOOLEAN DEFAULT FALSE,
    checklist_done BOOLEAN DEFAULT FALSE,
    scenario_attempted BOOLEAN DEFAULT FALSE,
    action_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_progress UNIQUE (user_id, lesson_id)
);

-- Trigger for user_progress
DROP TRIGGER IF EXISTS set_user_progress_timestamp ON user_progress;
CREATE TRIGGER set_user_progress_timestamp
BEFORE UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Campus Ambassador Applications Table
CREATE TABLE IF NOT EXISTS campus_ambassador_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    college_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'interested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for campus_ambassador_applications
DROP TRIGGER IF EXISTS set_campus_ambassador_timestamp ON campus_ambassador_applications;
CREATE TRIGGER set_campus_ambassador_timestamp
BEFORE UPDATE ON campus_ambassador_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Certificate Logs Table
CREATE TABLE IF NOT EXISTS certificate_logs (
    id BIGSERIAL PRIMARY KEY,
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    pathway_name VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for certificate_logs
DROP TRIGGER IF EXISTS set_certificate_logs_timestamp ON certificate_logs;
CREATE TRIGGER set_certificate_logs_timestamp
BEFORE UPDATE ON certificate_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
