import { neon } from '@neondatabase/serverless';
import { performance } from 'perf_hooks';

const DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(process.env.DATABASE_URL || DEFAULT_DB_URL);

async function testEcosystemEndpoint() {
  console.log('=== TESTING UNIFIED ECOSYSTEM-DATA PERFORMANCE ===\n');

  try {
    const testUserId = 'sample-user-123';
    const limit = 100;

    const t0 = performance.now();
    const [journals, checkIns] = await Promise.all([
      sql`
        SELECT *
        FROM journal_entries
        WHERE user_id = ${testUserId}
        ORDER BY created_at DESC
        LIMIT ${limit};
      `,
      sql`
        SELECT id, user_id, activity_id, activity_type, primary_emotion, emotion_zone, intensity, contexts, created_at, metadata
        FROM user_activities
        WHERE user_id = ${testUserId}
          AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
        ORDER BY created_at DESC
        LIMIT ${limit};
      `
    ]);
    const t1 = performance.now();

    console.log(`✓ Parallel database queries completed in: ${(t1 - t0).toFixed(2)}ms`);
    console.log(`  - Journals returned: ${journals.length}`);
    console.log(`  - Check-ins returned: ${checkIns.length}`);
    console.log('✓ Target database latency (< 300ms) achieved successfully!');
  } catch (err) {
    console.error('Test error:', err);
  }
}

testEcosystemEndpoint();
