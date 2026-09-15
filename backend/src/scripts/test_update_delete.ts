import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function testUpdateAndDelete() {
  console.log('Testing Update & Delete in Neon DB for journal entry...');

  // 1. Create a test entry
  const [created] = await sql`
    INSERT INTO journal_entries (user_id, title, content, entry_type, emotion)
    VALUES ('234306', 'Temporary Thought', 'This is a draft reflection to test update and delete flows.', 'free_write', 'Calm')
    RETURNING *;
  `;
  console.log('✓ Created:', created.id, created.title);

  // 2. Update the entry
  const [updated] = await sql`
    UPDATE journal_entries
    SET title = 'Updated Thought', content = 'Updated content to test edit flow.', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${created.id}
    RETURNING *;
  `;
  console.log('✓ Updated:', updated.id, updated.title, updated.content);

  // 3. Delete the entry
  const [deleted] = await sql`
    DELETE FROM journal_entries
    WHERE id = ${created.id}
    RETURNING id;
  `;
  console.log('✓ Safely Deleted ID:', deleted.id);
}

testUpdateAndDelete().catch(console.error);
