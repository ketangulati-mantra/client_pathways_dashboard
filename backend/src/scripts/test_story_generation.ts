import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { setupDb } from '../utils/setupDb.js';

async function runStoryGenerationVerification() {
  console.log('🚀 Starting Story Generation Engine Verification (Phase 4)...\n');

  try {
    await setupDb();

    const testUserA = `test-gen-user-a-${Date.now()}`;
    const testUserB = `test-gen-user-b-${Date.now()}`;

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserA}, ${testUserB});`;

    // Seed canonical data for User A
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserA}, 'daily_check_in', 'daily-check-in', 'Calm', 2, '["alone"]'::jsonb);
    `;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion)
      VALUES (${testUserA}, 'Finding quiet', 'I took time today to communicate my needs honestly and stepped back to rest.', 'free_write', 'Calm');
    `;

    // ==========================================
    // TEST 1: FIRST CHAPTER GENERATION (STORY GENESIS)
    // ==========================================
    console.log('1. Testing First Chapter Generation from "not_started"...');
    
    const mockCh1 = {
      title: 'Chapter 1: The First Bell by the Shore',
      content: 'You step across the cool wet pebbles as the morning tide pulls gently away from the harbor wall. In the distance, a bronze listening bell sways silently in the sea mist, suspended from a weathered archway of dark cedar. You reach out your hand, feeling the quiet resonance of the air around you. The path ahead remains unhurried, inviting you to take each slow step with purpose and ease.',
      narrative_summary: 'You arrived at the quiet harbor and discovered an ancient bronze listening bell.',
      open_threads: [{ id: 't1', text: 'The mystery of who chimed the harbor bell', status: 'open', created_in_chapter: 1 }],
      creative_metadata: { tone: 'clearing_skies_and_gentle_warmth' }
    };

    const gen1 = await storyService.generateNextChapterForUser(testUserA, {
      mockResponse: mockCh1
    });

    console.log(`   ✓ Chapter 1 created: ID=${gen1.chapter.id}, Number=${gen1.chapter.chapter_number}, Title="${gen1.chapter.title}"`);
    console.log(`   ✓ World Cycle assigned: "${gen1.state.current_cycle_name}" (Theme: "${gen1.state.world_theme}")`);
    console.log(`   ✓ State status: "${gen1.state.status}" (Expected: "active")`);
    console.log(`   ✓ Open threads count: ${gen1.state.open_threads.length} (Expected: 1)`);

    if (gen1.chapter.chapter_number !== 1 || gen1.state.status !== 'active' || gen1.state.open_threads.length !== 1) {
      throw new Error('First chapter generation failed validation!');
    }

    // ==========================================
    // TEST 2: CHAPTER 2 GENERATION & CONTINUITY
    // ==========================================
    console.log('\n2. Testing Subsequent Chapter Generation (Chapter 2 Continuity)...');

    const mockCh2 = {
      title: 'Chapter 2: The Inscribed Sea Glass',
      content: 'The bronze bell still hums with a faint vibration as you follow the tidal pathway toward the keeper’s cottage. Nestled in the sand by your boots is a piece of sea glass, etched with coordinates pointing toward the high ridge above the pines. You pocket the glass, sensing that the questions you carry are beginning to find their direction.',
      narrative_summary: 'You found an etched sea glass pointing toward the mountain ridge and deepened the search for the bell keeper.',
      open_threads: [
        { id: 't1', text: 'The mystery of who chimed the harbor bell', status: 'open', created_in_chapter: 1 },
        { id: 't2', text: 'The coordinates on the etched sea glass', status: 'open', created_in_chapter: 2 }
      ],
      creative_metadata: { tone: 'contemplative_quiet' }
    };

    const gen2 = await storyService.generateNextChapterForUser(testUserA, {
      mockResponse: mockCh2
    });

    console.log(`   ✓ Chapter 2 created: ID=${gen2.chapter.id}, Number=${gen2.chapter.chapter_number}, Title="${gen2.chapter.title}"`);
    console.log(`   ✓ Open threads evolved: ${gen2.state.open_threads.length} active threads`);
    if (gen2.chapter.chapter_number !== 2 || gen2.state.open_threads.length !== 2) {
      throw new Error('Chapter 2 continuity failed!');
    }

    // ==========================================
    // TEST 3: CONCURRENT / DOUBLE CLICK PROTECTION
    // ==========================================
    console.log('\n3. Testing Atomic Concurrency & Double-Click Lock Protection...');

    const mockCh3 = {
      title: 'Chapter 3: The Highland Path',
      content: 'You ascend the stone stairway leading up from the harbor into the pine ridge. With every step above the water, the horizon widens, revealing distant islands wrapped in soft morning light. The coordinate markings on your glass glow faintly in the sun.',
      narrative_summary: 'You climbed the ridge stairs.',
      open_threads: [{ id: 't2', text: 'The coordinates on the sea glass', status: 'open', created_in_chapter: 2 }]
    };

    // Fire 2 simultaneous generation requests
    const results = await Promise.allSettled([
      storyService.generateNextChapterForUser(testUserA, { mockResponse: mockCh3 }),
      storyService.generateNextChapterForUser(testUserA, { mockResponse: mockCh3 })
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    console.log(`   ✓ Simultaneous calls result: ${fulfilled.length} fulfilled, ${rejected.length} rejected with lock conflict`);
    
    // Exactly 1 must succeed, 1 must fail with STORY_GENERATION_IN_PROGRESS
    if (fulfilled.length !== 1 || rejected.length !== 1) {
      throw new Error(`Double-click protection failed: fulfilled=${fulfilled.length}, rejected=${rejected.length}`);
    }

    const countCh = await sql`SELECT COUNT(*) as count FROM story_chapters WHERE user_id = ${testUserA};`;
    console.log(`   ✓ Total chapters in DB for User A: ${countCh[0].count} (Expected: 3)`);
    if (parseInt(countCh[0].count, 10) !== 3) {
      throw new Error('Duplicate chapter was inserted!');
    }

    // ==========================================
    // TEST 4: PROVIDER FAILURE & LOCK RELEASE
    // ==========================================
    console.log('\n4. Testing AI Provider Failure & Lock Recovery...');

    let failedCaught = false;
    try {
      await storyService.generateNextChapterForUser(testUserA, {
        mockResponse: null // Will trigger generation error
      });
    } catch (err: any) {
      failedCaught = true;
      console.log(`   ✓ Correctly caught expected provider error: "${err.message}"`);
    }

    if (!failedCaught) throw new Error('Failed to catch simulated provider error');

    // Verify lock is released
    const stateAfterFail = await storyService.getStoryState(testUserA);
    console.log(`   ✓ State lock status after failure: is_generating=${stateAfterFail.is_generating} (Expected: false)`);
    if (stateAfterFail.is_generating !== false) {
      throw new Error('Lock remained stuck as true after failure!');
    }

    // ==========================================
    // TEST 5: MALFORMED OUTPUT VALIDATION
    // ==========================================
    console.log('\n5. Testing Malformed Output Validation...');

    const malformedOutput = {
      title: '', // Missing title
      content: 'Too short'
    };

    let malformedCaught = false;
    try {
      await storyService.generateNextChapterForUser(testUserA, {
        mockResponse: malformedOutput
      });
    } catch (err: any) {
      malformedCaught = true;
      console.log(`   ✓ Caught invalid output validation: "${err.message}"`);
    }

    if (!malformedCaught) throw new Error('Malformed output was not rejected!');

    // ==========================================
    // TEST 6: USER ISOLATION
    // ==========================================
    console.log('\n6. Testing User Isolation in Story Generation...');
    const userBState = await storyService.getStoryState(testUserB);
    const userBChapters = await storyService.getStoryChapters(testUserB);
    console.log(`   ✓ User B status: "${userBState.status}", chapters: ${userBChapters.length} (Expected: 0, User A has 3)`);
    if (userBChapters.length !== 0 || userBState.current_chapter_number !== 0) {
      throw new Error('User isolation violated!');
    }

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserA}, ${testUserB});`;

    console.log('\n✨ ALL PHASE 4 STORY GENERATION ENGINE TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('\n❌ Story Generation Verification Failed:', err);
    process.exit(1);
  }
}

runStoryGenerationVerification();
