import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function testSearch() {
  console.log('Testing Journal search in Neon DB...');

  const query = 'joy';
  const searchPattern = `%${query}%`;
  const userId = '234306';

  const results = await sql`
    SELECT id, title, content, entry_type, emotion, metadata
    FROM journal_entries
    WHERE user_id = ${userId}
      AND (
        title ILIKE ${searchPattern}
        OR content ILIKE ${searchPattern}
        OR COALESCE(emotion, '') ILIKE ${searchPattern}
        OR COALESCE(metadata->>'prompt', '') ILIKE ${searchPattern}
      )
    ORDER BY created_at DESC;
  `;

  console.log(`✓ Found ${results.length} matching reflections for query "${query}":`);
  results.forEach((r) => {
    console.log(` - [${r.id}] ${r.title} (${r.entry_type})`);
  });
}

testSearch().catch(console.error);
