import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in environment.');
  process.exit(1);
}

const sql = neon(connectionString);

async function setupDatabase() {
  console.log('⚡ Connecting to Neon PostgreSQL...');
  
  try {
    // 1. Create Timestamp update function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = CURRENT_TIMESTAMP;
         RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    console.log('✅ Created timestamp function.');

    // 2. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        service VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Created table: users');

    // 3. Lesson Completions Table
    await sql`
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
    `;
    console.log('✅ Created table: lesson_completions');

    // 4. User Progress Table
    await sql`
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
    `;
    console.log('✅ Created table: user_progress');

    // 5. Campus Ambassador Applications Table
    await sql`
      CREATE TABLE IF NOT EXISTS campus_ambassador_applications (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        college_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'interested',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Created table: campus_ambassador_applications');

    // 6. Certificate Logs Table
    await sql`
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
    `;
    console.log('✅ Created table: certificate_logs');

    // 7. Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log('\n📊 Tables in Neon Database:');
    tables.forEach(t => console.log(` - ${t.table_name}`));
    console.log('\n🎉 Neon Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up Neon Database:', error);
    process.exit(1);
  }
}

setupDatabase();
