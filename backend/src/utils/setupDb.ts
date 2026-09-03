import { sql } from '../db/client.js';
import { streakService } from '../services/streakService.js';

export async function setupDb() {
  console.log('⚡ Running Neon DB Schema Verification & Cleanup...');

  try {
    // 1. Drop Deprecated / Irrelevant Legacy Tables
    const deprecatedTables = [
      'campus_ambassadors',
      'campus_programs',
      'campus_ambassador_applications',
      'campus_program_applications',
      'ambassador_profiles',
      'ambassador_proofs',
      'corporate_partners',
      'corporate_partner_applications',
      'corporate_learning',
      'corporate_learning_progress',
      'program_learning',
      'program_learning_progress',
      'program_missions',
      'program_certificates',
      'program_notifications',
      'admins',
      'certificate_logs',
      'credit_ledger',
      'lesson_completions'
    ];

    for (const tableName of deprecatedTables) {
      try {
        await sql.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      } catch (err) {
        // Table might not exist or already dropped
      }
    }

    // 2. Verified Active Tables for the Platform

    // Table 1: users
    await sql`
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
    `;

    // Table 2: user_activities (Universal activity logger for Daily Check-In, Therapy, Lessons, etc.)
    await sql`
      CREATE TABLE IF NOT EXISTS user_activities (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        activity_id VARCHAR(255),
        activity_type VARCHAR(100) NOT NULL,
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
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_activity_id ON user_activities(activity_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);`;

    // Table 3: daily_check_in_days (Dedicated daily completion tracking with UNIQUE (user_id, check_in_date))
    await sql`
      CREATE TABLE IF NOT EXISTS daily_check_in_days (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        check_in_date DATE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        timezone VARCHAR(100) DEFAULT 'UTC',
        activity_id VARCHAR(255) DEFAULT 'daily-check-in',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_check_in_day UNIQUE (user_id, check_in_date)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_check_in_days_user_date ON daily_check_in_days(user_id, check_in_date DESC);`;

    // Table 4: streak_milestone_achievements (Track one-time milestone unlocks)
    await sql`
      CREATE TABLE IF NOT EXISTS streak_milestone_achievements (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        milestone INT NOT NULL,
        achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        streak_day_id BIGINT REFERENCES daily_check_in_days(id) ON DELETE SET NULL,
        CONSTRAINT unique_user_milestone UNIQUE (user_id, milestone)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_streak_milestones_user ON streak_milestone_achievements(user_id);`;

    // Table 5: user_streaks (Cache table for fast aggregate queries)
    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id VARCHAR(255) PRIMARY KEY,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_check_in_date DATE,
        total_check_in_days INT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Table 6: user_progress
    await sql`
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
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);`;

    // Table 7: activity_submissions
    await sql`
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
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_submissions_user_id ON activity_submissions(user_id);`;

    // Table 8: assessment_results
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        assessment_type VARCHAR(100) NOT NULL,
        score INT NOT NULL,
        category VARCHAR(100),
        answers JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);`;

    // Table 9: story_states (Tracks persistent story state, current narrative cycle, open threads)
    await sql`
      CREATE TABLE IF NOT EXISTS story_states (
        user_id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(50) NOT NULL DEFAULT 'not_started',
        current_chapter_number INT NOT NULL DEFAULT 0,
        current_cycle_id VARCHAR(100),
        current_cycle_name VARCHAR(255),
        world_theme VARCHAR(100),
        open_threads JSONB NOT NULL DEFAULT '[]'::jsonb,
        narrative_facts JSONB NOT NULL DEFAULT '{"characters":[],"locations":[],"symbols":[]}'::jsonb,
        recent_pacing JSONB NOT NULL DEFAULT '[]'::jsonb,
        recent_ending_styles JSONB NOT NULL DEFAULT '[]'::jsonb,
        cycle_progress JSONB NOT NULL DEFAULT '{"stage":"beginning","chapter_in_cycle":1}'::jsonb,
        next_cycle_preview JSONB DEFAULT NULL,
        is_generating BOOLEAN NOT NULL DEFAULT FALSE,
        generation_started_at TIMESTAMP WITH TIME ZONE,
        last_unlocked_at TIMESTAMP WITH TIME ZONE,
        last_chapter_date DATE DEFAULT NULL,
        timezone VARCHAR(100) DEFAULT 'UTC',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_story_states_user_id ON story_states(user_id);`;

    // Table 10: story_chapters (Append-only chronicle of generated story chapters)
    await sql`
      CREATE TABLE IF NOT EXISTS story_chapters (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        chapter_number INT NOT NULL,
        story_day_date DATE NOT NULL DEFAULT CURRENT_DATE,
        cycle_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        narrative_summary TEXT NOT NULL,
        source_inputs JSONB DEFAULT '[]'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_chapter UNIQUE (user_id, chapter_number),
        CONSTRAINT unique_user_story_day UNIQUE (user_id, story_day_date)
      );
    `;
    // Safe column migrations for existing databases
    try {
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'not_started';`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP WITH TIME ZONE;`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS last_chapter_date DATE DEFAULT NULL;`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';`;
      await sql`ALTER TABLE story_states ALTER COLUMN current_cycle_id DROP NOT NULL;`;
      await sql`ALTER TABLE story_states ALTER COLUMN current_cycle_name DROP NOT NULL;`;
      await sql`ALTER TABLE story_states ALTER COLUMN world_theme DROP NOT NULL;`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS narrative_facts JSONB NOT NULL DEFAULT '{"characters":[],"locations":[],"symbols":[]}'::jsonb;`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS recent_pacing JSONB NOT NULL DEFAULT '[]'::jsonb;`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS recent_ending_styles JSONB NOT NULL DEFAULT '[]'::jsonb;`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS cycle_progress JSONB NOT NULL DEFAULT '{"stage":"beginning","chapter_in_cycle":1}'::jsonb;`;
      await sql`ALTER TABLE story_states ADD COLUMN IF NOT EXISTS next_cycle_preview JSONB DEFAULT NULL;`;
      await sql`ALTER TABLE story_chapters ADD COLUMN IF NOT EXISTS story_day_date DATE DEFAULT CURRENT_DATE;`;
      await sql`ALTER TABLE story_chapters ADD COLUMN IF NOT EXISTS source_inputs JSONB DEFAULT '[]'::jsonb;`;
      await sql`ALTER TABLE story_chapters ALTER COLUMN cycle_id DROP NOT NULL;`;
      await sql`UPDATE story_chapters SET story_day_date = created_at::date WHERE story_day_date IS NULL;`;
      
      // Deduplicate any older development rows before enforcing unique constraint if needed
      await sql`
        DELETE FROM story_chapters a USING story_chapters b
        WHERE a.id < b.id 
          AND a.user_id = b.user_id 
          AND a.story_day_date = b.story_day_date;
      `;
    } catch (e) {
      console.warn('⚠️ Column migration notice:', e);
    }

    try {
      await sql`ALTER TABLE story_chapters ADD CONSTRAINT unique_user_story_day UNIQUE (user_id, story_day_date);`;
    } catch (e: any) {
      if (e.code !== '42710' && !e.message?.includes('already exists')) {
        console.warn('⚠️ Constraint creation error:', e);
      }
    }

    await sql`CREATE INDEX IF NOT EXISTS idx_story_chapters_user_id ON story_chapters(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_story_chapters_user_chapter ON story_chapters(user_id, chapter_number DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_story_chapters_user_day ON story_chapters(user_id, story_day_date DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_story_chapters_created_at ON story_chapters(created_at DESC);`;

    // 3. Run safe migration backfill for existing historical records
    await streakService.backfillStreaksFromHistory().catch((err) => {
      console.warn('⚠️ Non-critical warning in streak backfill:', err);
    });

    console.log('✅ Neon DB verified cleanly with streak, milestone, and story architecture.');
  } catch (error) {
    console.error('❌ Error in setupDb:', error);
    throw error;
  }
}
