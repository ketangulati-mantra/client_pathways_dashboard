import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function cleanTables() {
  console.log('Connecting to Neon DB...');
  
  // 1. Get all tables in public schema
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  
  console.log('Current tables in DB:', tables.map(t => t.table_name));

  // 2. Identify tables to drop
  const tablesToDrop = [
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

  console.log('\nExecuting DROP for tables:', tablesToDrop);

  for (const tableName of tablesToDrop) {
    try {
      await sql.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      console.log(`✓ Dropped table: ${tableName}`);
    } catch (e) {
      console.error(`✗ Failed to drop table ${tableName}:`, e);
    }
  }

  // 3. List final remaining tables in public schema
  const remainingTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('\n=======================================');
  console.log('Final Remaining Clean Tables in DB:');
  console.log(remainingTables.map(t => t.table_name));
  console.log('=======================================');
}

cleanTables().catch(console.error);
