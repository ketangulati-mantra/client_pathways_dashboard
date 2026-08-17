import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function run() {
  try {
    console.log('⚡ Cleaning up DB and updating `users` table...');

    // 1. Drop provider and ambassador specific tables
    const providerAmbassadorTables = [
      'ambassador_profiles',
      'campus_ambassador_applications',
      'campus_application_audit_history',
      'campus_program_applications',
      'provider_achievements_unlocked',
      'provider_growth_activities',
      'provider_growth_analytics_cache',
      'provider_growth_checklist',
      'provider_growth_hub_programs',
      'provider_growth_hub_resources',
      'provider_growth_missions',
      'provider_growth_stats',
      'provider_reputation_history',
      'provider_xp_ledger',
      'program_learning_progress',
      'credit_ledger',
      'program_missions',
      'program_notifications',
      'program_certificates'
    ];

    for (const tbl of providerAmbassadorTables) {
      await sql.query(`DROP TABLE IF EXISTS ${tbl} CASCADE;`);
      console.log(`🗑️ Dropped table (if existed): ${tbl}`);
    }

    // 2. Ensure users table exists with role and is_reviewer columns
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        service VARCHAR(50),
        role VARCHAR(50) DEFAULT 'user',
        is_reviewer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Alter columns in case table already exists
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS is_reviewer BOOLEAN DEFAULT FALSE;
    `;
    console.log('✅ Updated `users` table schema (added `role` & `is_reviewer` columns).');

    // 3. Print remaining clean table list
    const remainingTables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('\n📊 Clean Database Tables Remaining:', remainingTables.length);
    console.table(remainingTables.map(t => ({ TableName: t.table_name })).sort((a, b) => a.TableName.localeCompare(b.TableName)));

  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  }
}

run();
