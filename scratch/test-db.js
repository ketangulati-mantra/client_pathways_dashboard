import { sql } from '../backend/dist/db/client.js';

async function test() {
  try {
    const res1 = await sql`SELECT COUNT(*) FROM activity_submissions`;
    console.log('✅ activity_submissions count:', res1);
  } catch (err) {
    console.error('❌ activity_submissions query failed:', err.message);
  }

  try {
    const res2 = await sql`SELECT COUNT(*) FROM campus_applications`;
    console.log('✅ campus_applications count:', res2);
  } catch (err) {
    console.error('❌ campus_applications query failed:', err.message);
  }
}

test();
