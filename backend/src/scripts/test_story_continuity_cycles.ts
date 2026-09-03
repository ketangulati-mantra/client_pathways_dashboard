import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { setupDb } from '../utils/setupDb.js';

async function runStoryContinuityCyclesVerification() {
  console.log('🚀 Starting Phase 6: Continuity, Suspense & Cycles Verification...\n');

  try {
    await setupDb();

    const testUserA = `test-p6-user-a-${Date.now()}`;
    const testUserB = `test-p6-user-b-${Date.now()}`;

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserA}, ${testUserB});`;

    // Seed User A canonical reflection
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion)
      VALUES (${testUserA}, 'Reflecting on boundaries', 'I realized today that stepping back to listen gives me the clarity I need.', 'free_write', 'Calm');
    `;

    // =========================================================================
    // TEST 1: CHAPTER 1 GENESIS WITH FACTS & INTRODUCED THREAD
    // =========================================================================
    console.log('1. Testing Chapter 1 Genesis with Initial Facts & Thread...');

    const mockCh1 = {
      title: 'Chapter 1: The Lantern by the Harbor',
      content: 'You step across the cool wet stone steps as the morning tide pulls gently away from the harbor wall. In the distance, an elderly figure known as The Lantern Keeper adjusts a blue glass beacon suspended over the dark cedar archway. The bell above him sways silently in the mist.',
      narrative_summary: 'You met The Lantern Keeper by the quiet harbor and observed the blue glass beacon.',
      open_threads: [
        { id: 'thread_missing_letter', text: 'An unaddressed wax-sealed letter rests beneath the beacon.', status: 'introduced', importance: 'high' }
      ],
      narrative_facts: {
        characters: [{ name: 'The Lantern Keeper', role: 'guide', status: 'active' }],
        locations: [{ name: 'The Quiet Harbour', significance: 'place of reflection' }],
        symbols: [{ symbol: 'blue glass lantern', meaning: 'hope and uncertainty' }]
      }
    };

    const gen1 = await storyService.generateNextChapterForUser(testUserA, {
      mockResponse: mockCh1
    });

    console.log(`   ✓ Chapter 1 created: "${gen1.chapter.title}"`);
    console.log(`   ✓ Narrative facts stored: Characters=${gen1.state.narrative_facts?.characters.length}, Locations=${gen1.state.narrative_facts?.locations.length}`);
    console.log(`   ✓ Cycle Progress: Stage="${gen1.state.cycle_progress?.stage}", Chapter=${gen1.state.cycle_progress?.chapter_in_cycle}`);
    console.log(`   ✓ Pacing: "${gen1.state.recent_pacing?.[0]}", Ending: "${gen1.state.recent_ending_styles?.[0]}"`);

    if (
      gen1.state.narrative_facts?.characters.length !== 1 ||
      gen1.state.open_threads[0].status !== 'introduced' ||
      gen1.state.cycle_progress?.stage !== 'beginning'
    ) {
      throw new Error('Chapter 1 continuity facts or progress mismatch!');
    }

    // =========================================================================
    // TEST 2: CHAPTER 2 CONTINUITY & THREAD LIFECYCLE (DEVELOPING)
    // =========================================================================
    console.log('\n2. Testing Chapter 2 Continuity & Thread Evolution (Developing)...');

    const mockCh2 = {
      title: 'Chapter 2: The Coordinates in the Sand',
      content: 'The Lantern Keeper nods gently as you pick up the sealed letter. Written across the back in faded iron gall ink are coordinates pointing toward the coastal caves beyond the tide pools. You pocket the message and begin your descent toward the sea caves.',
      narrative_summary: 'The Lantern Keeper pointed you toward the coastal caves where the letter originated.',
      open_threads: [
        { id: 'thread_missing_letter', text: 'The sealed letter leads toward the coastal caves.', status: 'developing', importance: 'high' },
        { id: 'thread_echoing_tide', text: 'A strange harmonic echo resonates from the sea caves.', status: 'introduced', importance: 'medium' }
      ],
      narrative_facts: {
        locations: [{ name: 'The Coastal Caves', significance: 'hidden origin of the letter' }]
      }
    };

    const gen2 = await storyService.generateNextChapterForUser(testUserA, {
      mockResponse: mockCh2
    });

    console.log(`   ✓ Chapter 2 created: "${gen2.chapter.title}"`);
    console.log(`   ✓ Thread 1 evolved to: "${gen2.state.open_threads[0].status}"`);
    console.log(`   ✓ Total open threads: ${gen2.state.open_threads.length} (Expected: 2)`);
    console.log(`   ✓ Merged locations count: ${gen2.state.narrative_facts?.locations.length} (Expected: 2)`);

    if (
      gen2.state.open_threads[0].status !== 'developing' ||
      gen2.state.narrative_facts?.locations.length !== 2
    ) {
      throw new Error('Chapter 2 thread evolution or fact merging failed!');
    }

    // =========================================================================
    // TEST 3: CHAPTER 3 PACING VARIATION & THREAD ESCALATION
    // =========================================================================
    console.log('\n3. Testing Chapter 3 Turning Point Pacing & Thread Escalation...');

    const mockCh3 = {
      title: 'Chapter 3: The Chamber of Echoes',
      content: 'Inside the coastal cave, the rising tide begins to seal the lower entrance. On the stone pedestal ahead, the letter’s seal matches an ancient bronze keyhole. You step forward quickly before the salt water overtakes the stone stairs.',
      narrative_summary: 'You reached the inner pedestal as the water rose and unlocked the first chamber.',
      open_threads: [
        { id: 'thread_missing_letter', text: 'The mystery of the letter is escalating as water rises.', status: 'escalating', importance: 'high' }
      ]
    };

    const gen3 = await storyService.generateNextChapterForUser(testUserA, {
      mockResponse: mockCh3
    });

    console.log(`   ✓ Chapter 3 created: "${gen3.chapter.title}"`);
    console.log(`   ✓ Thread 1 status: "${gen3.state.open_threads[0].status}"`);
    console.log(`   ✓ Recent Pacing list: ${JSON.stringify(gen3.state.recent_pacing)}`);
    console.log(`   ✓ Recent Ending Styles: ${JSON.stringify(gen3.state.recent_ending_styles)}`);

    const pacings = gen3.state.recent_pacing || [];
    const endings = gen3.state.recent_ending_styles || [];
    if (pacings[0] === pacings[1] || endings[0] === endings[1]) {
      throw new Error('Pacing or ending styles repeated consecutively!');
    }

    // =========================================================================
    // TEST 4: CHAPTER 4 THREAD RESOLUTION & CYCLE ADVANCEMENT
    // =========================================================================
    console.log('\n4. Testing Chapter 4 Thread Resolution & Cycle Advancement...');

    const mockCh4 = {
      title: 'Chapter 4: The Key Turned',
      content: 'You turn the bronze key in the pedestal just as the water reaches your boots. The stone wall slides open smoothly, revealing a dry, glowing passage into the heart of the cliff where lanterns line the winding path.',
      narrative_summary: 'You resolved the mystery of the letter key and opened the passage into the cliff.',
      open_threads: [
        { id: 'thread_missing_letter', text: 'The letter was an invitation to the cliff passage.', status: 'resolved' },
        { id: 'thread_cliff_passage', text: 'Where the glowing cliff passage leads.', status: 'introduced' }
      ]
    };

    const gen4 = await storyService.generateNextChapterForUser(testUserA, {
      mockResponse: mockCh4
    });

    console.log(`   ✓ Chapter 4 created: "${gen4.chapter.title}"`);
    console.log(`   ✓ Resolved thread handled cleanly: ${gen4.state.open_threads.some(t => t.status === 'resolved')}`);

    // =========================================================================
    // TEST 5: CHAPTER 5 NEXT-CYCLE ANTICIPATION TEASER
    // =========================================================================
    console.log('\n5. Testing Chapter 5 Next-Cycle Preview Teaser...');

    const mockCh5 = {
      title: 'Chapter 5: The High Balcony',
      content: 'You emerge onto a high stone balcony overlooking the entire coastline. Below, the harbour lights glow softly, but far beyond them, across the northern ridge, a new constellation of mountain lanterns has begun to stir.',
      narrative_summary: 'You reached the high balcony and glimpsed distant mountain lights.',
      open_threads: [{ id: 'thread_cliff_passage', text: 'The destination beyond the balcony.', status: 'developing' }]
    };

    const gen5 = await storyService.generateNextChapterForUser(testUserA, {
      mockResponse: mockCh5
    });

    console.log(`   ✓ Chapter 5 created: "${gen5.chapter.title}"`);
    console.log(`   ✓ Cycle Progress: Stage="${gen5.state.cycle_progress?.stage}", Chapter In Cycle=${gen5.state.cycle_progress?.chapter_in_cycle}`);
    console.log(`   ✓ Next Cycle Preview: Status="${gen5.state.next_cycle_preview?.status}", Theme="${gen5.state.next_cycle_preview?.nextCycleName}"`);
    console.log(`   ✓ Teaser Text: "${gen5.state.next_cycle_preview?.previewText}"`);

    if (gen5.state.next_cycle_preview?.status !== 'teasing' || !gen5.state.next_cycle_preview?.previewText) {
      throw new Error('Next cycle teaser was not generated on Chapter 5!');
    }

    // =========================================================================
    // TEST 6: USER ISOLATION
    // =========================================================================
    console.log('\n6. Testing User Isolation...');
    const userBState = await storyService.getStoryState(testUserB);
    console.log(`   ✓ User B Facts: Characters=${userBState.narrative_facts?.characters.length} (Expected: 0)`);
    console.log(`   ✓ User B Previews: ${userBState.next_cycle_preview} (Expected: null)`);
    if (userBState.narrative_facts?.characters.length !== 0 || userBState.next_cycle_preview !== null) {
      throw new Error('User isolation violated!');
    }

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserA}, ${testUserB});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserA}, ${testUserB});`;

    console.log('\n✨ ALL PHASE 6 CONTINUITY, SUSPENSE & CYCLES TESTS PASSED! ✨\n');
  } catch (err) {
    console.error('\n❌ Phase 6 Verification Failed:', err);
    process.exit(1);
  }
}

runStoryContinuityCyclesVerification();
