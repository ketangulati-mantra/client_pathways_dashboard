import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL missing in backend/.env');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  console.log('🔄 Running Phase 4 Database Schema Migration on Neon DB...');

  // 1. Add versioning and review_reason columns to campus_program_applications
  await sql`
    ALTER TABLE campus_program_applications 
    ADD COLUMN IF NOT EXISTS version INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS parent_application_id BIGINT,
    ADD COLUMN IF NOT EXISTS review_reason TEXT;
  `;
  console.log('✅ Added version, parent_application_id, and review_reason to campus_program_applications');

  console.log('🌟 Phase 4 Database Migration Completed Successfully!');
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
