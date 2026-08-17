import { sql } from '../backend/dist/db/index.js';

async function fixSchema() {
  console.log('⚡ Dropping deprecated columns upa_id and provider_uid from activity_submissions in Neon DB...');

  try {
    await sql`ALTER TABLE activity_submissions DROP COLUMN IF EXISTS provider_uid;`;
    await sql`ALTER TABLE activity_submissions DROP COLUMN IF EXISTS upa_id;`;
    
    console.log('✅ Columns upa_id and provider_uid dropped successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema Fix Error:', err);
    process.exit(1);
  }
}

fixSchema();
