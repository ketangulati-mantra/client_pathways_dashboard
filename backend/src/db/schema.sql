-- ==============================================================================
-- Clean, Production-Ready Schema for Client Pathways & Mental Wellbeing Platform
-- Target Neon PostgreSQL Database
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
    service VARCHAR(50) DEFAULT 'therapy',
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Activities (Daily Check-Ins, Mood Logs, Pathway Completions)
CREATE TABLE IF NOT EXISTS user_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    activity_id VARCHAR(255) NOT NULL DEFAULT 'daily-check-in',
    activity_type VARCHAR(100) NOT NULL DEFAULT 'daily_check_in', -- 'daily_check_in', 'lesson_completion', 'assessment'
    lesson_id VARCHAR(255),
    service VARCHAR(100) DEFAULT 'therapy',
    emotion_zone VARCHAR(100),
    primary_emotion VARCHAR(100),
    additional_emotions JSONB DEFAULT '[]'::jsonb,
    intensity INT,
    contexts JSONB DEFAULT '[]'::jsonb,
    reflection TEXT,
    result_summary JSONB DEFAULT '{}'::jsonb,
    recommendation JSONB DEFAULT '{}'::jsonb,
    reward_points INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_id ON user_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);

-- 4. User Progress (Step-by-step progress & active resumption state)
CREATE TABLE IF NOT EXISTS user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    current_step INT DEFAULT 0,
    total_steps INT DEFAULT 0,
    action_done VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- 5. Activity Submissions (Forms, Reflections, Worksheets)
CREATE TABLE IF NOT EXISTS activity_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    service VARCHAR(100) DEFAULT 'therapy',
    form_data JSONB DEFAULT '{}'::jsonb,
    files JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_submissions_user_id ON activity_submissions(user_id);

-- 6. Assessment Results (Emotional Wellbeing Assessments, PHQ-9, GAD-7 scores)
CREATE TABLE IF NOT EXISTS assessment_results (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    assessment_id VARCHAR(255) NOT NULL,
    score INT,
    severity_level VARCHAR(100),
    answers JSONB DEFAULT '{}'::jsonb,
    summary JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_created_at ON assessment_results(created_at DESC);

-- 7. User Streaks (Daily Check-In consistency and engagement tracking)
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id VARCHAR(255) PRIMARY KEY,
    current_streak INT DEFAULT 1,
    longest_streak INT DEFAULT 1,
    total_checkins INT DEFAULT 1,
    last_checkin_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Challenges Catalogue
CREATE TABLE IF NOT EXISTS challenges (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    duration_days INT NOT NULL DEFAULT 21,
    cover_image VARCHAR(500),
    category VARCHAR(100) DEFAULT 'Mental Wellness',
    status VARCHAR(50) DEFAULT 'active',
    daily_time_minutes INT DEFAULT 10,
    key_milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Challenge Enrollments (Canonical challenge participation tracking)
CREATE TABLE IF NOT EXISTS challenge_enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    challenge_id VARCHAR(100) NOT NULL DEFAULT 'mantra_21',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_day INT NOT NULL DEFAULT 1,
    completed_days INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_user_id ON challenge_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_challenge_id ON challenge_enrollments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_status ON challenge_enrollments(status);

-- 10. Challenge Activity Completions (Verifiable per-day task completion)
CREATE TABLE IF NOT EXISTS challenge_activity_completions (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    challenge_id VARCHAR(100) NOT NULL DEFAULT 'mantra_21',
    challenge_day INT NOT NULL,
    activity_id VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_user_challenge_day UNIQUE (user_id, challenge_id, challenge_day)
);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_activity_completions(user_id, challenge_id);

-- 11. Challenge Leaderboard Snapshots (Computed daily, zero runtime overhead)
CREATE TABLE IF NOT EXISTS challenge_leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    challenge_id VARCHAR(100) NOT NULL DEFAULT 'mantra_21',
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_participants INT DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_challenge_snapshot_date UNIQUE (challenge_id, snapshot_date)
);

-- 12. Challenge Leaderboard Entries
CREATE TABLE IF NOT EXISTS challenge_leaderboard_entries (
    id BIGSERIAL PRIMARY KEY,
    snapshot_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_display_name VARCHAR(255),
    rank INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    streak INT NOT NULL DEFAULT 0,
    completed_days INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_snapshot_rank ON challenge_leaderboard_entries(snapshot_id, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user ON challenge_leaderboard_entries(user_id);


