import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function testJournal() {
  console.log('Testing Journal persistence in Neon DB for user 234306...');

  // 1. Insert test reflection
  const inserted = await sql`
    INSERT INTO journal_entries (
      user_id,
      title,
      content,
      entry_type,
      emotion,
      emotion_zone,
      intensity,
      check_in_date
    ) VALUES (
      '234306',
      'Quiet afternoon thoughts',
      'Took a quiet walk today without listening to podcasts. Letting my mind wander without an agenda felt surprisingly grounding and clear.',
      'free_write',
      'Calm',
      'low_pleasant',
      3,
      CURRENT_DATE
    )
    RETURNING *;
  `;

  console.log('✓ Successfully inserted journal entry:', inserted[0]);

  // 2. Fetch recent reflections
  const entries = await sql`
    SELECT id, title, content, emotion, check_in_date, created_at
    FROM journal_entries
    WHERE user_id = '234306'
    ORDER BY created_at DESC
    LIMIT 5;
  `;

  console.log('✓ Fetched recent entries for user 234306:', entries);
}

testJournal().catch(console.error);
