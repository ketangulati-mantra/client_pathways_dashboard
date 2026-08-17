import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL missing in backend/.env');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runConstraintFix() {
  console.log('🔄 Updating unique constraint to support multi-version applications on Neon DB...');

  // 1. Drop old single-version constraint if exists
  await sql`
    ALTER TABLE campus_program_applications 
    DROP CONSTRAINT IF EXISTS unique_user_program_app;
  `;
  console.log('✅ Dropped old single-version constraint unique_user_program_app');

  // 2. Add versioned multi-application constraint
  await sql`
    ALTER TABLE campus_program_applications 
    ADD CONSTRAINT unique_user_program_app_version UNIQUE (user_id, program_id, version);
  `;
  console.log('✅ Added multi-version constraint unique_user_program_app_version (user_id, program_id, version)');

  console.log('🌟 Version Constraint Migration Completed Successfully!');
}

runConstraintFix().catch(err => {
  console.error('❌ Constraint migration failed:', err);
  process.exit(1);
});
