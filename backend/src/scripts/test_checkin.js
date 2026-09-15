import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function testCheckIn() {
  console.log('Testing check-in insertion in Neon DB...');

  await sql`
    INSERT INTO user_activities (
      user_id, activity_id, activity_type, emotion_zone, primary_emotion, intensity, contexts, reflection, created_at
    ) VALUES 
    ('234306', 'daily-check-in', 'daily_check_in', 'high_unpleasant', 'Frustrated', 4, '["Working", "Workplace"]'::jsonb, 'Felt overwhelmed with tight project deadlines today.', CURRENT_TIMESTAMP),
    ('234306', 'daily-check-in', 'daily_check_in', 'low_pleasant', 'Calm', 2, '["Home", "Resting"]'::jsonb, 'Took an evening pause to breathe and reset.', CURRENT_TIMESTAMP - INTERVAL '1 day');
  `;

  const rows = await sql`
    SELECT id, user_id, activity_id, primary_emotion, intensity, reflection, created_at 
    FROM user_activities 
    WHERE user_id = '234306' 
    ORDER BY created_at DESC;
  `;

  console.log('Current DB entries for user 234306:', rows);
}

testCheckIn().catch(console.error);
