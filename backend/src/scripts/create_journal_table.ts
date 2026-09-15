import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function main() {
  console.log('Creating journal_entries table in Neon DB...');

  await sql`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id BIGSERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(500),
      content TEXT NOT NULL,
      entry_type VARCHAR(100) NOT NULL DEFAULT 'free_write', -- 'free_write', 'reflect_today', 'guided_prompt'
      emotion VARCHAR(100),
      emotion_zone VARCHAR(100),
      intensity INT,
      check_in_id BIGINT,
      check_in_date DATE DEFAULT CURRENT_DATE,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON journal_entries(entry_type);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);`;

  console.log('✓ journal_entries table verified and indexed in Neon DB.');
}

main().catch(console.error);
