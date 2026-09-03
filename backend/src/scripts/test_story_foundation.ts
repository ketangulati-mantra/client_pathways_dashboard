import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { setupDb } from '../utils/setupDb.js';

async function runStoryFoundationVerification() {
  console.log('🚀 Starting Corrected Story Foundation Verification (Phase 2.1)...\n');

  try {
    // 1. Run DB setup to ensure schema and columns exist
    console.log('1. Verifying Database Schema & Column Migrations...');
    await setupDb();
    console.log('   ✓ Schema setup verified.\n');

    // 2. Test User Isolation Keys
    const testUserA = `test-story-user-a-${Date.now()}`;
    const testUserB = `test-story-user-b-${Date.now()}`;

    // Clean up any previous test records
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserA}, ${testUserB});`;

    // 3. Test Neutral Unstarted Initialization
    console.log('2. Testing Neutral Unstarted Story Initialization...');
    const stateA1 = await storyService.getStoryState(testUserA);
    console.log(`   ✓ User A initialized: status="${stateA1.status}", chapter_number=${stateA1.current_chapter_number}, cycle=${stateA1.current_cycle_name}`);
    if (stateA1.status !== 'not_started') throw new Error('Initial status should be "not_started"');
    if (stateA1.current_chapter_number !== 0) throw new Error('Initial chapter should be 0');
    if (stateA1.current_cycle_id !== null) throw new Error('Initial cycle should be null (not hardcoded)');

    // 4. Test Idempotent Repeated Initialization
    console.log('\n3. Testing Idempotency & Duplicate Prevention...');
    const stateA2 = await storyService.getStoryState(testUserA);
    const countRows = await sql`SELECT COUNT(*) as count FROM story_states WHERE user_id = ${testUserA};`;
    console.log(`   ✓ Story states count for User A: ${countRows[0].count} (Expected: 1)`);
    if (parseInt(countRows[0].count, 10) !== 1) throw new Error('Duplicate story state created!');

    // 5. Test Concurrent Safety
    console.log('\n4. Testing Concurrent Initialization Safety...');
    const concurrentUser = `test-concurrent-${Date.now()}`;
    await Promise.all([
      storyService.getStoryState(concurrentUser),
      storyService.getStoryState(concurrentUser),
      storyService.getStoryState(concurrentUser)
    ]);
    const concurrentCount = await sql`SELECT COUNT(*) as count FROM story_states WHERE user_id = ${concurrentUser};`;
    console.log(`   ✓ Concurrent initialization count: ${concurrentCount[0].count} (Expected: 1)`);
    if (parseInt(concurrentCount[0].count, 10) !== 1) throw new Error('Concurrent initialization failed duplicate check!');
    await sql`DELETE FROM story_states WHERE user_id = ${concurrentUser};`;

    // 6. Test Chapter Creation with Cross-Source Traceability
    console.log('\n5. Testing Chapter Storage & Cross-Source Input Traceability...');
    const chapter1 = await storyService.createChapter({
      user_id: testUserA,
      chapter_number: 1,
      story_day_date: '2026-09-03',
      cycle_id: 'whispering_highlands',
      cycle_name: 'The Whispering Highlands',
      world_theme: 'alpine_solitude',
      title: 'Chapter 1: The Mountain Gate',
      content: 'You step through the ancient cedar trees as the mountain wind carries a distant melody...',
      narrative_summary: 'You reached the mountain gate and discovered an inscribed stone key.',
      source_inputs: [
        { source_type: 'journal_entry', source_id: 101 },
        { source_type: 'daily_check_in', source_id: 202 }
      ],
      open_threads: [{ id: 't1', text: 'The mystery of the stone key', created_in_chapter: 1 }]
    });
    console.log(`   ✓ Chapter 1 created: ID=${chapter1.id}, Title="${chapter1.title}"`);
    console.log(`   ✓ Cross-source inputs verified: ${JSON.stringify(chapter1.source_inputs)}`);

    if (!Array.isArray(chapter1.source_inputs) || chapter1.source_inputs.length !== 2) {
      throw new Error('source_inputs failed to store array of cross-source references!');
    }

    // 7. Verify State Updated to Active
    const updatedStateA = await storyService.getStoryState(testUserA);
    console.log(`   ✓ User A state after chapter 1: status="${updatedStateA.status}", cycle="${updatedStateA.current_cycle_name}"`);
    if (updatedStateA.status !== 'active') throw new Error('State should become active after chapter creation');

    // 8. Verify Latest Chapter Lookup
    console.log('\n6. Testing Latest Chapter Lookup...');
    const latestA = await storyService.getLatestChapter(testUserA);
    console.log(`   ✓ Latest chapter for User A: Chapter ${latestA?.chapter_number} - "${latestA?.title}"`);
    if (latestA?.chapter_number !== 1) throw new Error('Latest chapter mismatch!');

    // 9. Verify User Isolation
    console.log('\n7. Testing User Isolation...');
    const stateB = await storyService.getStoryState(testUserB);
    const chaptersB = await storyService.getStoryChapters(testUserB);
    const latestB = await storyService.getLatestChapter(testUserB);
    console.log(`   ✓ User B status: "${stateB.status}", chapters count: ${chaptersB.length} (Expected: 0)`);
    console.log(`   ✓ User B latest chapter: ${latestB} (Expected: null)`);
    if (chaptersB.length !== 0 || latestB !== null) throw new Error('User isolation violated!');

    // 10. Clean up test users
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserA}, ${testUserB});`;

    console.log('\n✨ ALL PHASE 2.1 STORY FOUNDATION CORRECTION TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  }
}

runStoryFoundationVerification();
