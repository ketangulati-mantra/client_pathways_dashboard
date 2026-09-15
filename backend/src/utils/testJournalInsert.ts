import { sql } from '../db/index.js';

async function testNaN() {
  const userId = '234306';
  const finalTitle = 'Test NaN';
  const trimmedContent = 'Test content';
  const entryType = 'reflect_today';
  const emotion = 'Grounded';
  const emotionZone = 'low_pleasant';
  const intensity = '3';
  const checkInId = 'chk_1788266333773_3pz9i2k'; // From checkInId field!
  const checkInDate = '2026-09-01';
  const metadata = { prompts: [] };

  try {
    const result = await sql`
      INSERT INTO journal_entries (
        user_id,
        title,
        content,
        entry_type,
        emotion,
        emotion_zone,
        intensity,
        check_in_id,
        check_in_date,
        metadata
      ) VALUES (
        ${userId},
        ${finalTitle},
        ${trimmedContent},
        ${entryType},
        ${emotion || null},
        ${emotionZone || null},
        ${intensity ? parseInt(intensity, 10) : null},
        ${checkInId ? parseInt(checkInId, 10) : null},
        ${checkInDate || new Date().toISOString().split('T')[0]},
        ${JSON.stringify(metadata)}
      )
      RETURNING *;
    `;
    console.log('Insert with string checkInId succeeded:', result[0]);
  } catch (err: any) {
    console.log('Caught EXACT error:', err.message);
  }
}

testNaN().catch(console.error);
