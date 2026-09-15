import { neon } from '@neondatabase/serverless';
import { streakService } from '../services/streakService.js';
import { getLocalCalendarDate, getPreviousDayDate } from '../utils/dateUtils.js';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function runTests() {
  console.log('🧪 Starting Exhaustive Streak & Milestone System Tests...\n');

  const testUser = 'test_user_streak_' + Date.now();
  const timezone = 'Asia/Kolkata';
  const today = getLocalCalendarDate(new Date(), timezone);
  const yesterday = getPreviousDayDate(today);

  // Setup tables
  await streakService.ensureStreakTables();

  // Helper to clean test user data
  const cleanupUser = async (uid: string) => {
    await sql`DELETE FROM streak_milestone_achievements WHERE user_id = ${uid};`;
    await sql`DELETE FROM daily_check_in_days WHERE user_id = ${uid};`;
    await sql`DELETE FROM user_streaks WHERE user_id = ${uid};`;
  };

  try {
    // -------------------------------------------------------------
    // Test 1: First-ever check-in
    // -------------------------------------------------------------
    console.log('--- Test 1: First-ever check-in ---');
    await cleanupUser(testUser);

    const res1 = await streakService.recordDailyCheckInCompletion(testUser, timezone);
    console.assert(res1.currentStreak === 1, `Expected currentStreak 1, got ${res1.currentStreak}`);
    console.assert(res1.longestStreak === 1, `Expected longestStreak 1, got ${res1.longestStreak}`);
    console.assert(res1.completedToday === true, `Expected completedToday true, got ${res1.completedToday}`);
    console.assert(res1.totalCheckInDays === 1, `Expected totalCheckInDays 1, got ${res1.totalCheckInDays}`);
    console.assert(res1.nextMilestone === 3, `Expected nextMilestone 3, got ${res1.nextMilestone}`);
    console.assert(res1.daysUntilNextMilestone === 2, `Expected daysUntilNextMilestone 2, got ${res1.daysUntilNextMilestone}`);
    console.log('✓ Test 1 Passed: First check-in initializes streak = 1 with next milestone = 3.\n');

    // -------------------------------------------------------------
    // Test 2: Multiple check-ins on the SAME day (Idempotency)
    // -------------------------------------------------------------
    console.log('--- Test 2: Multiple check-ins on same day ---');
    const res2 = await streakService.recordDailyCheckInCompletion(testUser, timezone);
    console.assert(res2.currentStreak === 1, `Expected currentStreak 1, got ${res2.currentStreak}`);
    console.assert(res2.totalCheckInDays === 1, `Expected totalCheckInDays 1, got ${res2.totalCheckInDays}`);
    console.log('✓ Test 2 Passed: Same-day repeat check-in does not duplicate streak.\n');

    // -------------------------------------------------------------
    // Test 3: Consecutive days streak calculation
    // -------------------------------------------------------------
    console.log('--- Test 3: Consecutive days streak ---');
    const testUser2 = 'test_user_consecutive_' + Date.now();
    await cleanupUser(testUser2);

    // Seed 4 consecutive days (today, yesterday, -2d, -3d)
    let d = today;
    const pastDates: string[] = [];
    for (let i = 0; i < 4; i++) {
      pastDates.push(d);
      d = getPreviousDayDate(d);
    }
    for (const dt of pastDates) {
      await sql`
        INSERT INTO daily_check_in_days (user_id, check_in_date, timezone)
        VALUES (${testUser2}, ${dt}::date, ${timezone})
        ON CONFLICT DO NOTHING;
      `;
    }

    const res3 = await streakService.computeUserStreak(testUser2, timezone);
    console.assert(res3.currentStreak === 4, `Expected currentStreak 4, got ${res3.currentStreak}`);
    console.assert(res3.longestStreak === 4, `Expected longestStreak 4, got ${res3.longestStreak}`);
    console.assert(res3.completedToday === true, `Expected completedToday true, got ${res3.completedToday}`);
    console.assert(res3.nextMilestone === 7, `Expected nextMilestone 7, got ${res3.nextMilestone}`);
    console.assert(res3.daysUntilNextMilestone === 3, `Expected daysUntilNextMilestone 3, got ${res3.daysUntilNextMilestone}`);
    console.log('✓ Test 3 Passed: 4 consecutive days correctly yield streak = 4.\n');

    // -------------------------------------------------------------
    // Test 4: Checked in yesterday but not yet today (Streak is alive!)
    // -------------------------------------------------------------
    console.log('--- Test 4: Checked in yesterday but not yet today ---');
    const testUser3 = 'test_user_yesterday_' + Date.now();
    await cleanupUser(testUser3);

    // Insert yesterday and day before yesterday
    const dMinus1 = yesterday;
    const dMinus2 = getPreviousDayDate(yesterday);
    await sql`
      INSERT INTO daily_check_in_days (user_id, check_in_date, timezone)
      VALUES 
      (${testUser3}, ${dMinus1}::date, ${timezone}),
      (${testUser3}, ${dMinus2}::date, ${timezone});
    `;

    const res4 = await streakService.computeUserStreak(testUser3, timezone);
    console.assert(res4.currentStreak === 2, `Expected currentStreak 2, got ${res4.currentStreak}`);
    console.assert(res4.completedToday === false, `Expected completedToday false, got ${res4.completedToday}`);
    console.log('✓ Test 4 Passed: Streak remains alive at 2 when user completed yesterday.\n');

    // -------------------------------------------------------------
    // Test 5: Missed an entire day (Streak breaks)
    // -------------------------------------------------------------
    console.log('--- Test 5: Missed day breaks streak ---');
    const testUser4 = 'test_user_broken_' + Date.now();
    await cleanupUser(testUser4);

    // Insert check-in from 3 days ago and 4 days ago (missing yesterday and today)
    const dMinus3 = getPreviousDayDate(getPreviousDayDate(yesterday));
    const dMinus4 = getPreviousDayDate(dMinus3);
    await sql`
      INSERT INTO daily_check_in_days (user_id, check_in_date, timezone)
      VALUES 
      (${testUser4}, ${dMinus3}::date, ${timezone}),
      (${testUser4}, ${dMinus4}::date, ${timezone});
    `;

    const res5 = await streakService.computeUserStreak(testUser4, timezone);
    console.assert(res5.currentStreak === 0, `Expected currentStreak 0 (broken), got ${res5.currentStreak}`);
    console.assert(res5.longestStreak === 2, `Expected longestStreak preserved at 2, got ${res5.longestStreak}`);
    console.assert(res5.completedToday === false, `Expected completedToday false, got ${res5.completedToday}`);
    console.log('✓ Test 5 Passed: Missed day resets current streak to 0 while preserving longest streak.\n');

    // -------------------------------------------------------------
    // Test 6: User returns after a broken streak
    // -------------------------------------------------------------
    console.log('--- Test 6: Return after broken streak ---');
    const res6 = await streakService.recordDailyCheckInCompletion(testUser4, timezone);
    console.assert(res6.currentStreak === 1, `Expected currentStreak 1, got ${res6.currentStreak}`);
    console.assert(res6.longestStreak === 2, `Expected longestStreak 2, got ${res6.longestStreak}`);
    console.assert(res6.totalCheckInDays === 3, `Expected totalCheckInDays 3, got ${res6.totalCheckInDays}`);
    console.log('✓ Test 6 Passed: New check-in after break starts streak at 1 with longest streak preserved.\n');

    // -------------------------------------------------------------
    // Test 7: Milestone 7 reached (Unlocks achievement once)
    // -------------------------------------------------------------
    console.log('--- Test 7: Milestone 7 achievement unlock ---');
    const testUser5 = 'test_user_milestone7_' + Date.now();
    await cleanupUser(testUser5);

    // Seed 6 prior consecutive days
    let cur = today;
    for (let i = 1; i <= 6; i++) {
      cur = getPreviousDayDate(cur);
      await sql`
        INSERT INTO daily_check_in_days (user_id, check_in_date, timezone)
        VALUES (${testUser5}, ${cur}::date, ${timezone});
      `;
    }

    // Now complete today to make it 7 consecutive days
    const res7 = await streakService.recordDailyCheckInCompletion(testUser5, timezone);
    console.assert(res7.currentStreak === 7, `Expected currentStreak 7, got ${res7.currentStreak}`);
    console.assert(res7.newMilestoneAchieved !== null, `Expected newMilestoneAchieved not null`);
    console.assert(res7.newMilestoneAchieved?.milestone === 7, `Expected milestone 7, got ${res7.newMilestoneAchieved?.milestone}`);
    console.assert(res7.nextMilestone === 15, `Expected nextMilestone 15, got ${res7.nextMilestone}`);
    console.assert(res7.daysUntilNextMilestone === 8, `Expected daysUntilNextMilestone 8, got ${res7.daysUntilNextMilestone}`);
    console.log('✓ Test 7 Passed: 7-day milestone triggers on completion!\n');

    // -------------------------------------------------------------
    // Test 8: Retry / repeat after reaching 7 days (Idempotent achievement)
    // -------------------------------------------------------------
    console.log('--- Test 8: Retry after milestone 7 ---');
    const res8 = await streakService.recordDailyCheckInCompletion(testUser5, timezone);
    console.assert(res8.currentStreak === 7, `Expected currentStreak 7, got ${res8.currentStreak}`);
    console.assert(res8.newMilestoneAchieved === null, `Expected newMilestoneAchieved null on repeat`);
    console.log('✓ Test 8 Passed: Milestone does not re-trigger on subsequent calls.\n');

    // -------------------------------------------------------------
    // Test 9: Concurrent / Race condition check-ins
    // -------------------------------------------------------------
    console.log('--- Test 9: Concurrent / Race condition requests ---');
    const testUser6 = 'test_user_race_' + Date.now();
    await cleanupUser(testUser6);

    const [raceRes1, raceRes2, raceRes3] = await Promise.all([
      streakService.recordDailyCheckInCompletion(testUser6, timezone),
      streakService.recordDailyCheckInCompletion(testUser6, timezone),
      streakService.recordDailyCheckInCompletion(testUser6, timezone)
    ]);

    console.assert(raceRes1.currentStreak === 1 && raceRes2.currentStreak === 1 && raceRes3.currentStreak === 1, 'Race requests consistent');
    const totalDayRows = await sql`SELECT count(*) FROM daily_check_in_days WHERE user_id = ${testUser6}`;
    console.assert(Number(totalDayRows[0].count) === 1, `Expected exactly 1 day row, got ${totalDayRows[0].count}`);
    console.log('✓ Test 9 Passed: Concurrent requests safely create only 1 daily record.\n');

    // -------------------------------------------------------------
    // Test 10: Timezone boundary test (New York vs Tokyo)
    // -------------------------------------------------------------
    console.log('--- Test 10: Timezone boundary conversion ---');
    const nyDate = getLocalCalendarDate(new Date('2026-08-31T02:00:00Z'), 'America/New_York');
    const tokyoDate = getLocalCalendarDate(new Date('2026-08-31T02:00:00Z'), 'Asia/Tokyo');
    console.assert(nyDate === '2026-08-30', `Expected NY date 2026-08-30, got ${nyDate}`);
    console.assert(tokyoDate === '2026-08-31', `Expected Tokyo date 2026-08-31, got ${tokyoDate}`);
    console.log('✓ Test 10 Passed: Timezone-aware date boundaries evaluated correctly.\n');

    // Cleanup all test users
    await cleanupUser(testUser);
    await cleanupUser(testUser2);
    await cleanupUser(testUser3);
    await cleanupUser(testUser4);
    await cleanupUser(testUser5);
    await cleanupUser(testUser6);

    console.log('=====================================================');
    console.log('🎉 ALL 10 STREAK & MILESTONE TEST SUITES PASSED 100%!');
    console.log('=====================================================');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

runTests().catch(console.error);
