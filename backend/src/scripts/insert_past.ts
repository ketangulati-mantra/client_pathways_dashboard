import { sql } from '../db/index.js';
import { streakService } from '../services/streakService.js';

async function insertPastEntries() {
  const userId = '234306';
  console.log(`Inserting check-ins for past 2 days for user ${userId}...`);

  const now = new Date();
  
  const d1 = new Date(now);
  d1.setDate(d1.getDate() - 1);
  const dateStr1 = d1.toISOString().split('T')[0];

  const d2 = new Date(now);
  d2.setDate(d2.getDate() - 2);
  const dateStr2 = d2.toISOString().split('T')[0];

  console.log(`Adding dates: ${dateStr2} (2 days ago) and ${dateStr1} (yesterday)`);

  // 1. Insert into daily_check_in_days
  await sql`
    INSERT INTO daily_check_in_days (user_id, check_in_date, timezone, completed_at)
    VALUES 
      (${userId}, ${dateStr2}::date, 'Asia/Kolkata', ${d2.toISOString()}::timestamptz),
      (${userId}, ${dateStr1}::date, 'Asia/Kolkata', ${d1.toISOString()}::timestamptz)
    ON CONFLICT (user_id, check_in_date)
    DO UPDATE SET completed_at = EXCLUDED.completed_at;
  `;

  // 2. Insert into user_activities
  await sql`
    INSERT INTO user_activities (
      user_id, activity_id, activity_type, emotion_zone, primary_emotion, intensity, contexts, reflection, created_at
    ) VALUES 
      (${userId}, 'daily-check-in', 'daily_check_in', 'low_pleasant', 'Calm', 2, '["Home", "Resting"]'::jsonb, 'A quiet evening to breathe and unwind.', ${d1.toISOString()}::timestamptz),
      (${userId}, 'daily-check-in', 'daily_check_in', 'high_pleasant', 'Inspired', 4, '["Working", "School"]'::jsonb, 'Had great creative energy tackling new challenges.', ${d2.toISOString()}::timestamptz);
  `;

  // 3. Compute and update user_streaks
  const summary = await streakService.computeUserStreak(userId, 'Asia/Kolkata');
  console.log('Updated user streak summary:', summary);

  const checkInDays = await sql`
    SELECT check_in_date, completed_at 
    FROM daily_check_in_days 
    WHERE user_id = ${userId} 
    ORDER BY check_in_date DESC;
  `;
  console.log('All check-in dates for user:', checkInDays);

  const activities = await sql`
    SELECT id, primary_emotion, intensity, reflection, created_at 
    FROM user_activities 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 6;
  `;
  console.log('Recent user activities:', activities);

  console.log('✅ Successfully inserted past 2 days check-in records and computed streak!');
}

insertPastEntries().catch(console.error);
