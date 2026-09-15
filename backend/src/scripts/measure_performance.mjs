import { neon } from '@neondatabase/serverless';
import { performance } from 'perf_hooks';

const DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(process.env.DATABASE_URL || DEFAULT_DB_URL);

async function runBenchmark() {
  console.log('=== MEASURING DATABASE QUERY & INDEX PERFORMANCE ===\n');

  try {
    // 1. Inspect existing indexes on journal_entries and user_activities
    const indexRes = await sql`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('journal_entries', 'user_activities')
      ORDER BY tablename, indexname;
    `;

    console.log('1. Existing Database Indexes:');
    indexRes.forEach(idx => {
      console.log(`   [${idx.tablename}] ${idx.indexname}: ${idx.indexdef}`);
    });

    const testUserId = 'sample-user-123';

    // 2. Measure single query latency for journal_entries
    console.log('\n2. Measuring Query Latencies:');
    const t0 = performance.now();
    const journals = await sql`
      SELECT id, user_id, title, content, entry_type, emotion, created_at, metadata
      FROM journal_entries
      WHERE user_id = ${testUserId}
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    const t1 = performance.now();
    console.log(`   - journal_entries query duration: ${(t1 - t0).toFixed(2)}ms (Rows returned: ${journals.length})`);

    // 3. Measure single query latency for user_activities
    const t2 = performance.now();
    const activities = await sql`
      SELECT id, user_id, activity_id, activity_type, primary_emotion, intensity, created_at, metadata
      FROM user_activities
      WHERE user_id = ${testUserId}
        AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    const t3 = performance.now();
    console.log(`   - user_activities query duration: ${(t3 - t2).toFixed(2)}ms (Rows returned: ${activities.length})`);

    // 4. Measure Parallel Execution via Promise.all
    const t4 = performance.now();
    const [parallelJournals, parallelActivities] = await Promise.all([
      sql`
        SELECT id, user_id, title, content, entry_type, emotion, created_at, metadata
        FROM journal_entries
        WHERE user_id = ${testUserId}
        ORDER BY created_at DESC
        LIMIT 100;
      `,
      sql`
        SELECT id, user_id, activity_id, activity_type, primary_emotion, intensity, created_at, metadata
        FROM user_activities
        WHERE user_id = ${testUserId}
          AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
        ORDER BY created_at DESC
        LIMIT 100;
      `
    ]);
    const t5 = performance.now();
    console.log(`   - Parallel Promise.all duration: ${(t5 - t4).toFixed(2)}ms`);

    // 5. Test EXPLAIN ANALYZE for journal_entries
    console.log('\n3. Query Execution Plan (EXPLAIN ANALYZE):');
    const explainJournal = await sql`
      EXPLAIN ANALYZE
      SELECT id, user_id, title, content, entry_type, emotion, created_at, metadata
      FROM journal_entries
      WHERE user_id = ${testUserId}
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    explainJournal.forEach(row => console.log(`   ${row['QUERY PLAN']}`));

  } catch (err) {
    console.error('Benchmark error:', err);
  }
}

runBenchmark();
