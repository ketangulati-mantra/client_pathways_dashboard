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
  console.log('🔄 Running Phase 3.5 Database Schema Migration on Neon DB...');

  // 1. Add ambassador_id column to ambassador_profiles
  await sql`
    ALTER TABLE ambassador_profiles 
    ADD COLUMN IF NOT EXISTS ambassador_id VARCHAR(50) UNIQUE;
  `;
  console.log('✅ Added ambassador_id to ambassador_profiles');

  // 2. Add review metadata columns to campus_program_applications
  await sql`
    ALTER TABLE campus_program_applications 
    ADD COLUMN IF NOT EXISTS requested_info_fields JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS resubmission_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approval_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS activation_at TIMESTAMP WITH TIME ZONE;
  `;
  console.log('✅ Added Phase 3.5 review columns to campus_program_applications');

  // 3. Create campus_application_audit_history table
  await sql`
    CREATE TABLE IF NOT EXISTS campus_application_audit_history (
      id BIGSERIAL PRIMARY KEY,
      application_id BIGINT,
      user_id VARCHAR(255) NOT NULL,
      program_id VARCHAR(100) DEFAULT 'campus_awareness',
      from_status VARCHAR(50),
      to_status VARCHAR(50) NOT NULL,
      changed_by VARCHAR(255) DEFAULT 'system',
      notes TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ Created campus_application_audit_history table');

  console.log('🌟 Phase 3.5 Database Migration Completed Successfully!');
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
