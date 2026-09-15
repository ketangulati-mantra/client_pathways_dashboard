import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function syncSchema() {
  console.log('Connecting to Neon DB for Schema Sync...');

  // 1. Drop irrelevant legacy tables
  const tablesToDrop = ['certificate_logs', 'credit_ledger'];
  for (const t of tablesToDrop) {
    try {
      await sql.query(`DROP TABLE IF EXISTS "${t}" CASCADE;`);
      console.log(`✓ Removed irrelevant table: ${t}`);
    } catch (e) {
      console.error(`✗ Error dropping ${t}:`, e);
    }
  }

  // 2. Create / Update Relevant Platform Tables

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
  console.log('✓ Verified table: users');

  // Table 2: user_activities
  await sql`
    CREATE TABLE IF NOT EXISTS user_activities (
      id BIGSERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
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
  await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);`;
  console.log('✓ Verified table: user_activities');

  // Table 3: user_progress
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
  console.log('✓ Verified table: user_progress');

  // Table 4: activity_submissions
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
  console.log('✓ Verified table: activity_submissions');

  // Table 5: assessment_results
  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_assessment_results_created_at ON assessment_results(created_at DESC);`;
  console.log('✓ Verified table: assessment_results');

  // Table 6: user_streaks
  await sql`
    CREATE TABLE IF NOT EXISTS user_streaks (
      user_id VARCHAR(255) PRIMARY KEY,
      current_streak INT DEFAULT 1,
      longest_streak INT DEFAULT 1,
      total_checkins INT DEFAULT 1,
      last_checkin_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Verified table: user_streaks');

  // 3. Final tables listing
  const finalTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  console.log('\n=============================================');
  console.log('Active Production Tables in Neon DB:');
  console.log(finalTables.map(t => t.table_name));
  console.log('=============================================');
}

syncSchema().catch(console.error);
