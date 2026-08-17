import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function run() {
  try {
    console.log('⚡ Dropping specified tables: admins, certificate_logs, lesson_completions, user_progress...');

    const tablesToDrop = [
      'admins',
      'certificate_logs',
      'lesson_completions',
      'user_progress'
    ];

    for (const tbl of tablesToDrop) {
      await sql.query(`DROP TABLE IF EXISTS ${tbl} CASCADE;`);
      console.log(`🗑️ Dropped table: ${tbl}`);
    }

    const remainingTables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('\n📊 Database Tables Remaining:', remainingTables.length);
    console.table(remainingTables.map(t => ({ TableName: t.table_name })).sort((a, b) => a.TableName.localeCompare(b.TableName)));

  } catch (err) {
    console.error('❌ Error dropping tables:', err);
  }
}

run();
