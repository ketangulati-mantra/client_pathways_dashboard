import { sql } from '../db/index.js';

async function run() {
  console.log('Inspecting recent user activities for 234306...');
  const rows = await sql`
    SELECT id, user_id, primary_emotion, created_at, metadata
    FROM user_activities
    WHERE user_id = '234306'
    ORDER BY created_at DESC
    LIMIT 6;
  `;
  console.log('Recent 6 activities:', rows);

  if (rows.length >= 2 && rows[0].primary_emotion === 'Grounded' && rows[1].primary_emotion === 'Grounded') {
    console.log(`Deleting duplicate row ID: ${rows[0].id}`);
    await sql`DELETE FROM user_activities WHERE id = ${rows[0].id};`;
    console.log('Duplicate row deleted successfully!');
  }

  const freshRows = await sql`
    SELECT id, user_id, primary_emotion, created_at
    FROM user_activities
    WHERE user_id = '234306'
    ORDER BY created_at DESC
    LIMIT 4;
  `;
  console.log('Fresh user activities:', freshRows);
}

run().catch(console.error);
