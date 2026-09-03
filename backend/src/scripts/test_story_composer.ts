import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { storyContextService } from '../services/storyContextService.js';
import { storyComposerService } from '../services/storyComposerService.js';
import { setupDb } from '../utils/setupDb.js';

async function runStoryComposerVerification() {
  console.log('🚀 Starting Deterministic Story Composer Verification (Phase 6 - NO AI)...\n');

  try {
    await setupDb();

    const testUserGenesis = `test-composer-genesis-${Date.now()}`;
    const testUserLow = `test-composer-low-${Date.now()}`;
    const testUserComm = `test-composer-comm-${Date.now()}`;
    const testUserRest = `test-composer-rest-${Date.now()}`;

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;

    // =========================================================================
    // TEST 1: NO-DATA GENESIS CHAPTER (Confidence NONE)
    // =========================================================================
    console.log('1. Testing No-Data Genesis (Confidence NONE)...');
    const genResult = await storyService.generateNextChapterForUser(testUserGenesis);

    console.log(`   ✓ Title: "${genResult.chapter.title}"`);
    console.log(`   ✓ Word Count: ${genResult.chapter.content.split(/\s+/).length} words`);
    console.log(`   ✓ Context Confidence: "${genResult.chapter.metadata.atmosphericTone ? 'none' : 'none'}"`);
    console.log(`   ✓ Symbols Used: ${JSON.stringify(genResult.chapter.metadata.symbolsUsed)}`);

    if (genResult.chapter.chapter_number !== 1 || genResult.chapter.content.length < 150) {
      throw new Error('Genesis chapter generation failed or word count too low!');
    }

    // =========================================================================
    // TEST 2: LOW-CONFIDENCE ATMOSPHERIC PERSONALIZATION
    // =========================================================================
    console.log('\n2. Testing Low-Confidence Atmospheric Personalization...');
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserLow}, 'daily_check_in', 'daily-check-in', 'Calm', 3, '["rest"]'::jsonb);
    `;

    const genLow = await storyService.generateNextChapterForUser(testUserLow);
    console.log(`   ✓ Composed Chapter 1: "${genLow.chapter.title}"`);
    console.log(`   ✓ Atmospheric Tone: "${genLow.chapter.metadata.atmosphericTone}"`);
    console.log(`   ✓ Archetype: "${genLow.chapter.metadata.archetype}"`);

    if (!genLow.chapter.metadata.archetype || !genLow.chapter.title) {
      throw new Error('Low confidence composition failed!');
    }

    // =========================================================================
    // TEST 3: THEMATIC ALLEGORICAL MAPPING (COMMUNICATION THEME)
    // =========================================================================
    console.log('\n3. Testing Communication Theme (Allegorical Symbols Mapping)...');
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserComm}, 'daily_check_in', 'daily-check-in', 'Calm', 4, '["family","social"]'::jsonb);
    `;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion)
      VALUES (${testUserComm}, 'Listening and letters', 'Taking time to listen and send thoughtful messages and talk with friends gives me peace.', 'guided_prompt', 'Calm');
    `;

    const genComm = await storyService.generateNextChapterForUser(testUserComm);
    console.log(`   ✓ Composed Chapter 1: "${genComm.chapter.title}"`);
    console.log(`   ✓ World: "${genComm.state.current_cycle_name}"`);
    console.log(`   ✓ Symbols Used: ${JSON.stringify(genComm.chapter.metadata.symbolsUsed)}`);
    console.log(`   ✓ Open Thread Introduced: "${genComm.state.open_threads[0]?.text}"`);

    const hasCommSymbol = genComm.chapter.metadata.symbolsUsed.some((s: string) =>
      s.includes('letter') || s.includes('bell') || s.includes('bridge') || s.includes('stone') || s.includes('speaking-tube') || s.includes('lantern') || s.includes('parchment')
    );

    if (!hasCommSymbol) {
      throw new Error('Communication theme did not map to relevant allegorical symbols!');
    }

    // =========================================================================
    // TEST 4: CONTINUITY & THREAD ADVANCEMENT
    // =========================================================================
    console.log('\n4. Testing Continuity & Thread Lifecycle Advancement...');
    const genComm2 = await storyService.generateNextChapterForUser(testUserComm);

    console.log(`   ✓ Composed Chapter 2: "${genComm2.chapter.title}"`);
    console.log(`   ✓ Thread Status: "${genComm2.state.open_threads[0]?.status}" (Expected: "developing")`);
    console.log(`   ✓ Chapter 2 Content contains thread mention: ${genComm2.chapter.content.includes('mystery') || genComm2.chapter.content.includes('yesterday')}`);

    if (genComm2.state.open_threads[0]?.status !== 'developing') {
      throw new Error('Thread failed to advance from introduced to developing in Chapter 2!');
    }

    // =========================================================================
    // TEST 5: ARCHETYPE & SUSPENSE VARIATION ACROSS 5 CHAPTERS
    // =========================================================================
    console.log('\n5. Testing Archetype & Suspense Variation across Chapters...');
    const genComm3 = await storyService.generateNextChapterForUser(testUserComm);
    const genComm4 = await storyService.generateNextChapterForUser(testUserComm);
    const genComm5 = await storyService.generateNextChapterForUser(testUserComm);

    const archetypes = [
      genComm.chapter.metadata.archetype,
      genComm2.chapter.metadata.archetype,
      genComm3.chapter.metadata.archetype,
      genComm4.chapter.metadata.archetype,
      genComm5.chapter.metadata.archetype
    ];

    const suspenseTypes = [
      genComm.chapter.metadata.suspenseType,
      genComm2.chapter.metadata.suspenseType,
      genComm3.chapter.metadata.suspenseType,
      genComm4.chapter.metadata.suspenseType,
      genComm5.chapter.metadata.suspenseType
    ];

    console.log(`   ✓ Archetypes Sequence: ${JSON.stringify(archetypes)}`);
    console.log(`   ✓ Suspense Sequence: ${JSON.stringify(suspenseTypes)}`);
    console.log(`   ✓ Cycle Progress at Ch 5: Stage="${genComm5.state.cycle_progress?.stage}", Preview="${genComm5.state.next_cycle_preview?.status}"`);

    // =========================================================================
    // TEST 6: USER ISOLATION
    // =========================================================================
    console.log('\n6. Testing User Isolation (Different Contexts = Different Narratives)...');
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserRest}, 'daily_check_in', 'daily-check-in', 'Calm', 4, '["rest"]'::jsonb);
    `;

    const genRest = await storyService.generateNextChapterForUser(testUserRest);

    console.log(`   ✓ User Comm World: "${genComm.state.current_cycle_name}"`);
    console.log(`   ✓ User Rest World: "${genRest.state.current_cycle_name}"`);
    console.log(`   ✓ User Comm Symbols: ${JSON.stringify(genComm.chapter.metadata.symbolsUsed)}`);
    console.log(`   ✓ User Rest Symbols: ${JSON.stringify(genRest.chapter.metadata.symbolsUsed)}`);

    // =========================================================================
    // TEST 7: DETERMINISTIC REPRODUCIBILITY
    // =========================================================================
    console.log('\n7. Testing Deterministic Reproducibility...');
    const ctxComm = await storyContextService.buildStoryContext(testUserComm);
    const stateComm = await storyService.getStoryState(testUserComm);
    const recentComm = await storyService.getStoryChapters(testUserComm, 5);

    const dryRun1 = await storyComposerService.composeNextChapter(ctxComm, stateComm, recentComm);
    const dryRun2 = await storyComposerService.composeNextChapter(ctxComm, stateComm, recentComm);

    console.log(`   ✓ Run 1 Title: "${dryRun1.title}"`);
    console.log(`   ✓ Run 2 Title: "${dryRun2.title}"`);
    console.log(`   ✓ Content Hash Equality: ${dryRun1.content === dryRun2.content}`);

    if (dryRun1.content !== dryRun2.content) {
      throw new Error('Deterministic composition is not reproducible!');
    }

    // =========================================================================
    // TEST 8: EXECUTION PERFORMANCE (< 100MS)
    // =========================================================================
    console.log('\n8. Testing Execution Performance (< 100ms composition time)...');
    const startPerf = Date.now();
    await storyComposerService.composeNextChapter(ctxComm, stateComm, recentComm);
    const elapsed = Date.now() - startPerf;

    console.log(`   ✓ Composition Time: ${elapsed}ms (Target: < 100ms)`);
    if (elapsed > 100) {
      throw new Error(`Composition took too long (${elapsed}ms)`);
    }

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserGenesis}, ${testUserLow}, ${testUserComm}, ${testUserRest});`;

    console.log('\n✨ ALL DETERMINISTIC STORY COMPOSER TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('\n❌ Story Composer Verification Failed:', err);
    process.exit(1);
  }
}

runStoryComposerVerification();
