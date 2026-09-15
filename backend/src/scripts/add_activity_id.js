import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function addActivityIdColumn() {
  console.log('Adding activity_id column and index to user_activities in Neon DB...');

  await sql`
    ALTER TABLE user_activities 
    ADD COLUMN IF NOT EXISTS activity_id VARCHAR(255) DEFAULT 'daily-check-in';
  `;

  await sql`
    UPDATE user_activities 
    SET activity_id = 'daily-check-in' 
    WHERE activity_id IS NULL OR activity_id = '';
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_activities_activity_id 
    ON user_activities(activity_id);
  `;

  console.log('✓ Successfully added and indexed activity_id column.');

  const sample = await sql`
    SELECT id, user_id, activity_id, activity_type, primary_emotion, created_at 
    FROM user_activities 
    WHERE user_id = '234306';
  `;

  console.log('Current rows for user 234306:', sample);
}

addActivityIdColumn().catch(console.error);
