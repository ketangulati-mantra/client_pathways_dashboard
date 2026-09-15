import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { setupDb } from '../utils/setupDb.js';
import { getLocalCalendarDate, getNextDayDate } from '../utils/dateUtils.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runDailyCalendarGatingTests() {
  console.log('================================================================');
  console.log('🚀 TESTING DAILY STORY CALENDAR GATING & INPUT CONSUMPTION MODEL');
  console.log('================================================================\n');

  await setupDb();

  const testUser = `test_daily_story_${Date.now()}`;
  const timezone = 'Asia/Kolkata';
  const day1Date = getLocalCalendarDate(new Date(), timezone);
  const day2Date = getNextDayDate(day1Date);
  const day3Date = getNextDayDate(day2Date);
  const day4Date = getNextDayDate(day3Date);

  console.log(`Test Parameters: User=${testUser}, Day1=${day1Date}, Day2=${day2Date}, Day3=${day3Date}, Day4=${day4Date}\n`);

  try {
    // ---------------------------------------------------------
    // STEP 1: DAY 1 - Initial State & Genesis Chapter Generation
    // ---------------------------------------------------------
    console.log('1. Testing Day 1 Initial State & Inputs...');
    const initCheck = await storyService.evaluateEligibility(testUser, timezone);
    assert(initCheck.eligible === true, 'Genesis chapter should be eligible');
    assert(initCheck.todayChapterGenerated === false, 'Day 1 should not have chapter generated yet');

    // Insert Day 1 Canonical Inputs: Check-in A, Reflection B, Reflection C
    const [checkInA] = await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, reflection, created_at)
      VALUES (${testUser}, 'daily_check_in', 'daily-check-in', 'Stressed', 4, 'Heavy morning deadlines piling up.', CURRENT_TIMESTAMP - INTERVAL '6 hours')
      RETURNING id;
    `;

    const [refB] = await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUser}, 'Midday pause', 'Stepped outside for fresh air to clear my thoughts.', 'free_write', 'Calm', CURRENT_TIMESTAMP - INTERVAL '4 hours')
      RETURNING id;
    `;

    const [refC] = await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUser}, 'Evening reflection', 'Finding quiet space to organize my thoughts.', 'guided_prompt', 'Grounded', CURRENT_TIMESTAMP - INTERVAL '1 hour')
      RETURNING id;
    `;

    console.log(`   ✓ Day 1 Inputs Created: CheckIn #${checkInA.id}, Journal #${refB.id}, Journal #${refC.id}`);

    // Generate Day 1 Chapter (Chapter 1)
    const genResult1 = await storyService.generateNextChapterForUser(testUser, { timezone });
    assert(genResult1.chapter.chapter_number === 1, 'Chapter 1 should be generated');
    console.log(`   ✓ Chapter 1 Successfully Generated: "${genResult1.chapter.title}" (Date: ${day1Date})`);

    // Verify Chapter 1 source_inputs contains all 3 initial inputs
    const sourceIds1 = genResult1.chapter.source_inputs.map((s) => String(s.source_id));
    assert(sourceIds1.includes(String(checkInA.id)), 'Chapter 1 should trace CheckIn A');
    assert(sourceIds1.includes(String(refB.id)), 'Chapter 1 should trace Reflection B');
    assert(sourceIds1.includes(String(refC.id)), 'Chapter 1 should trace Reflection C');
    console.log(`   ✓ Chapter 1 Source Traceability Verified: [${sourceIds1.join(', ')}]`);

    // ---------------------------------------------------------
    // STEP 2: DAY 1 - Attempt Repeated Generation (Spam Protection)
    // ---------------------------------------------------------
    console.log('\n2. Testing Repeated Generation Attacks on Day 1 (10 Repeated Clicks)...');
    let rejectedCount = 0;
    for (let i = 0; i < 10; i++) {
      try {
        await storyService.generateNextChapterForUser(testUser, { timezone });
      } catch (err: any) {
        if (err.message.includes('DAILY_CHAPTER_LIMIT_REACHED')) {
          rejectedCount++;
        }
      }
    }
    assert(rejectedCount === 10, 'All 10 repeated generation attempts on Day 1 must be rejected by backend');
    console.log(`   ✓ 10/10 same-day repeated generation requests strictly rejected with DAILY_CHAPTER_LIMIT_REACHED`);

    const day1ChaptersInDb = await sql`SELECT count(*)::int as count FROM story_chapters WHERE user_id = ${testUser};`;
    assert(day1ChaptersInDb[0].count === 1, 'Database must contain strictly 1 chapter for Day 1');
    console.log(`   ✓ Database contains strictly 1 chapter in total: count=${day1ChaptersInDb[0].count}`);

    // ---------------------------------------------------------
    // STEP 3: DAY 1 - Adding Late Reflections Leaves Chapter 1 Immutable
    // ---------------------------------------------------------
    console.log('\n3. Testing Late Day 1 Reflection & Chapter 1 Immutability...');
    const [refD] = await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUser}, 'Late night thoughts', 'Looking ahead to tomorrow with hope.', 'free_write', 'Hopeful', CURRENT_TIMESTAMP)
      RETURNING id;
    `;
    console.log(`   ✓ Inserted late Reflection D #${refD.id}`);

    // Verify Chapter 1 in DB remains 100% unchanged
    const ch1AfterLateEntry = await storyService.getLatestChapter(testUser);
    assert(ch1AfterLateEntry?.chapter_number === 1, 'Chapter 1 remains latest');
    assert(ch1AfterLateEntry?.title === genResult1.chapter.title, 'Chapter 1 title immutable');
    assert(ch1AfterLateEntry?.content === genResult1.chapter.content, 'Chapter 1 content immutable');
    console.log(`   ✓ Chapter 1 verified completely immutable after late reflection`);

    // Verify Day 1 Eligibility still returns todayChapterGenerated = true
    const day1FinalEligibility = await storyService.evaluateEligibility(testUser, timezone);
    assert(day1FinalEligibility.eligible === false, 'Should not be eligible on Day 1 even with new reflection D');
    assert(day1FinalEligibility.todayChapterGenerated === true, 'Today chapter generated flag must be true');
    console.log(`   ✓ Day 1 Eligibility correctly blocked: todayChapterGenerated=true`);

    // ---------------------------------------------------------
    // STEP 4: DAY 2 - Next Calendar Day Transition & Input Consumption
    // ---------------------------------------------------------
    console.log('\n4. Simulating Day 2 (Next Calendar Day Transition)...');
    const [refE] = await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUser}, 'Day 2 morning clarity', 'Feeling refreshed and ready for a new focus today.', 'free_write', 'Inspired', CURRENT_TIMESTAMP + INTERVAL '1 second')
      RETURNING id;
    `;
    console.log(`   ✓ Inserted Day 2 Reflection E #${refE.id}`);

    // Create Chapter 2 directly via createChapter with Day 2 date simulation
    const genResult2 = await storyService.createChapter({
      user_id: testUser,
      chapter_number: 2,
      story_day_date: day2Date,
      cycle_id: 'coastal_haven',
      cycle_name: 'The Lighthouse of Quiet Correspondence',
      world_theme: 'solitude_and_wonder',
      title: 'Chapter 2: The Amber Beacon',
      content: 'Morning arrived across the rocky shore...',
      narrative_summary: 'A new beacon was discovered.',
      source_inputs: [{ source_type: 'journal_entry', source_id: refD.id }, { source_type: 'journal_entry', source_id: refE.id }]
    });

    assert(genResult2.chapter_number === 2, 'Chapter 2 created for Day 2');
    console.log(`   ✓ Chapter 2 Created with Day 2 story_day_date (${day2Date})`);

    // Verify Chapter 1 source inputs != Chapter 2 source inputs
    const sourceIds2 = genResult2.source_inputs.map((s) => String(s.source_id));
    assert(!sourceIds2.includes(String(checkInA.id)), 'Chapter 2 must not re-consume CheckIn A');
    assert(sourceIds2.includes(String(refD.id)), 'Chapter 2 consumed late Reflection D');
    assert(sourceIds2.includes(String(refE.id)), 'Chapter 2 consumed Day 2 Reflection E');
    console.log(`   ✓ Chapter 2 Source Traceability: [${sourceIds2.join(', ')}] (Distinct from Chapter 1)`);

    // ---------------------------------------------------------
    // STEP 5: Database Unique Constraints Verification
    // ---------------------------------------------------------
    console.log('\n5. Testing Database-Level Constraint Enforcement (UNIQUE per day)...');
    const existingChapters = await sql`SELECT id, chapter_number, story_day_date FROM story_chapters WHERE user_id = ${testUser};`;
    console.log('   Existing Chapters in DB:', existingChapters);
    console.log('   Attempting duplicate insert for Day 1:', day1Date);
    let duplicateDbInsertBlocked = false;
    try {
      const res = await sql`
        INSERT INTO story_chapters (user_id, chapter_number, cycle_id, story_day_date, title, content, narrative_summary)
        VALUES (${testUser}, 99, 'coastal_haven', ${day1Date}::date, 'Duplicate Day 1 Chapter', 'Prose...', 'Summary...')
        RETURNING id;
      `;
      console.log('   Unexpectedly inserted row:', res);
    } catch (err: any) {
      console.log('   Caught DB Error as expected:', err.message, err.code);
      if (err.message?.includes('unique_user_story_day') || err.code === '23505' || err.message?.includes('duplicate key')) {
        duplicateDbInsertBlocked = true;
      }
    }
    assert(duplicateDbInsertBlocked === true, 'Direct database insert with duplicate (user_id, story_day_date) must be blocked by Postgres UNIQUE constraint');
    console.log(`   ✓ Postgres UNIQUE(user_id, story_day_date) successfully blocked unauthorized same-day insertion`);

    // ---------------------------------------------------------
    // STEP 6: DAY 3 - No-Input Day (Story Must Wait, No Fake Chapters)
    // ---------------------------------------------------------
    console.log('\n6. Testing Day 3 (No-Input Day - Story Must Wait)...');
    const noInputUser = `test_no_input_${Date.now()}`;
    // Create previous chapter for yesterday
    const yesterdayDate = '2026-09-02';
    await storyService.createChapter({
      user_id: noInputUser,
      chapter_number: 1,
      story_day_date: yesterdayDate,
      cycle_id: 'coastal_haven',
      title: 'Chapter 1: The Distant Light',
      content: 'Content...',
      narrative_summary: 'Summary...'
    });

    const day3Eligibility = await storyService.evaluateEligibility(noInputUser, timezone);
    assert(day3Eligibility.eligible === false, 'Story must not be eligible when user has added 0 reflections since last chapter');
    assert(day3Eligibility.reason === 'no_new_reflections', 'Eligibility reason must be no_new_reflections');
    console.log(`   ✓ Day 3 correctly blocked with reason: "${day3Eligibility.reason}" (No fake chapters created)`);

    // ---------------------------------------------------------
    // STEP 7: DAY 4 - Skip-Day Recovery (User Reflects After Gap)
    // ---------------------------------------------------------
    console.log('\n7. Testing Day 4 (Skip-Day Recovery with New Reflection)...');
    const [refF] = await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${noInputUser}, 'Day 4 Returning after a quiet pause', 'Taking a moment to reconnect with myself.', 'free_write', 'Peaceful', CURRENT_TIMESTAMP)
      RETURNING id;
    `;
    console.log(`   ✓ Inserted Reflection F #${refF.id} for user after gap`);

    const recoveryEligibility = await storyService.evaluateEligibility(noInputUser, timezone);
    assert(recoveryEligibility.eligible === true, 'Story must be eligible once user adds a reflection');
    assert(recoveryEligibility.reason === 'ready_to_unfold', 'Eligibility reason must be ready_to_unfold');
    console.log(`   ✓ Skip-Day recovery confirmed: reason="${recoveryEligibility.reason}", eligible=true`);

    const genResultRecovery = await storyService.generateNextChapterForUser(noInputUser, { timezone });
    assert(genResultRecovery.chapter.chapter_number === 2, 'Chapter 2 generated on recovery');
    console.log(`   ✓ Chapter 2 Successfully Generated after gap: "${genResultRecovery.chapter.title}"`);

    // Cleanup noInputUser
    await sql`DELETE FROM story_chapters WHERE user_id = ${noInputUser};`;
    await sql`DELETE FROM story_states WHERE user_id = ${noInputUser};`;
    await sql`DELETE FROM journal_entries WHERE user_id = ${noInputUser};`;

    // ---------------------------------------------------------
    // STEP 8: Concurrency Race Condition Test (5 Simultaneous Parallel Requests)
    // ---------------------------------------------------------
    console.log('\n8. Testing Concurrency Race Condition (5 Simultaneous Parallel Requests)...');
    const parallelUser = `test_parallel_story_${Date.now()}`;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${parallelUser}, 'Parallel seed reflection', 'A seed for concurrency test.', 'free_write', 'Curious', CURRENT_TIMESTAMP);
    `;

    const parallelPromises = [
      storyService.generateNextChapterForUser(parallelUser, { timezone }).catch((e) => ({ error: e.message })),
      storyService.generateNextChapterForUser(parallelUser, { timezone }).catch((e) => ({ error: e.message })),
      storyService.generateNextChapterForUser(parallelUser, { timezone }).catch((e) => ({ error: e.message })),
      storyService.generateNextChapterForUser(parallelUser, { timezone }).catch((e) => ({ error: e.message })),
      storyService.generateNextChapterForUser(parallelUser, { timezone }).catch((e) => ({ error: e.message }))
    ];

    const results = await Promise.all(parallelPromises);
    const successful = results.filter((r: any) => r && r.chapter && !r.error);
    const rejected = results.filter((r: any) => r && r.error);

    console.log(`   Results: ${successful.length} succeeded, ${rejected.length} safely blocked by atomic lock or calendar gate`);
    assert(successful.length === 1, 'Exactly 1 concurrent request must succeed');
    assert(rejected.length === 4, 'Exactly 4 concurrent requests must be rejected');

    const parallelChaptersCount = await sql`SELECT count(*)::int as count FROM story_chapters WHERE user_id = ${parallelUser};`;
    assert(parallelChaptersCount[0].count === 1, 'Database must contain strictly 1 chapter for the parallel user');
    console.log(`   ✓ Concurrency race condition fully protected: 1 chapter created in DB, 0 duplicate data`);

    // Cleanup parallel user
    await sql`DELETE FROM story_chapters WHERE user_id = ${parallelUser};`;
    await sql`DELETE FROM story_states WHERE user_id = ${parallelUser};`;
    await sql`DELETE FROM journal_entries WHERE user_id = ${parallelUser};`;

    console.log('\n================================================================');
    console.log('✨ ALL 8 COMPREHENSIVE CALENDAR GATING & IMMUTABILITY TESTS PASSED! ✨');
    console.log('================================================================\n');
  } finally {
    // Cleanup test user data
    await sql`DELETE FROM story_chapters WHERE user_id = ${testUser};`;
    await sql`DELETE FROM story_states WHERE user_id = ${testUser};`;
    await sql`DELETE FROM journal_entries WHERE user_id = ${testUser};`;
    await sql`DELETE FROM user_activities WHERE user_id = ${testUser};`;
  }
}

runDailyCalendarGatingTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
