import { sql } from '../db/client.js';
import { storyService, StoryChapter, StoryState } from '../services/storyService.js';
import { storyComposerService } from '../services/storyComposerService.js';
import { storyContextService } from '../services/storyContextService.js';
import { setupDb } from '../utils/setupDb.js';

async function runPhase8LongTermVariationTests() {
  console.log('🚀 Starting Phase 8: Long-Term Narrative Quality & Anti-Repetition Verification (20 Chapters)...\n');

  try {
    await setupDb();

    const testUserLong = `test-p8-user-${Date.now()}`;

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id = ${testUserLong};`;
    await sql`DELETE FROM story_states WHERE user_id = ${testUserLong};`;
    await sql`DELETE FROM journal_entries WHERE user_id = ${testUserLong};`;
    await sql`DELETE FROM user_activities WHERE user_id = ${testUserLong};`;

    // Seed realistic canonical data
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES
        (${testUserLong}, 'Morning clarity', 'Felt a sense of ease walking in the garden today.', 'free_write', 'Calm', NOW() - INTERVAL '5 days'),
        (${testUserLong}, 'Heavy workload', 'Struggling with deadlines and needing to set boundaries.', 'free_write', 'Overwhelmed', NOW() - INTERVAL '3 days'),
        (${testUserLong}, 'Good conversation', 'Had a restorative call with an old friend.', 'guided_entry', 'Grateful', NOW() - INTERVAL '1 day');
    `;

    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts, created_at)
      VALUES
        (${testUserLong}, 'daily_check_in', 'daily-check-in', 'Calm', 3, '["rest"]'::jsonb, NOW() - INTERVAL '2 days'),
        (${testUserLong}, 'daily_check_in', 'daily-check-in', 'Anxious', 4, '["work"]'::jsonb, NOW() - INTERVAL '1 day');
    `;

    // =========================================================================
    // TEST 1: 20 SEQUENTIAL CHAPTERS GENERATION
    // =========================================================================
    console.log('1. Composing 20 Sequential Chapters to test Long-Term Anti-Repetition...');
    const generatedChapters: StoryChapter[] = [];
    const openingKeys: string[] = [];
    const suspenseTypes: string[] = [];
    const archetypes: string[] = [];
    const symbolsUsed: string[] = [];

    const startTime = Date.now();

    for (let i = 1; i <= 20; i++) {
      const res = await storyService.generateNextChapterForUser(testUserLong);
      generatedChapters.push(res.chapter);

      const meta = res.chapter.metadata;
      openingKeys.push(meta.openingKey || '');
      suspenseTypes.push(meta.suspenseType || '');
      archetypes.push(meta.archetype || '');
      if (meta.symbolsUsed && meta.symbolsUsed[0]) {
        symbolsUsed.push(meta.symbolsUsed[0]);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`   ✓ Successfully generated 20 consecutive chapters in ${totalDuration}ms (${(totalDuration / 20).toFixed(2)}ms/chapter)`);

    // =========================================================================
    // TEST 2: ANTI-REPETITION CHECKS ACROSS OPENINGS & SUSPENSE
    // =========================================================================
    console.log('\n2. Testing Opening & Suspense Anti-Repetition Rules...');

    let consecutiveOpeningCollisions = 0;
    for (let i = 1; i < openingKeys.length; i++) {
      if (openingKeys[i] === openingKeys[i - 1] && openingKeys[i] !== '') {
        consecutiveOpeningCollisions++;
      }
    }
    console.log(`   ✓ Consecutive Opening Collisions: ${consecutiveOpeningCollisions} (Expected: 0)`);
    if (consecutiveOpeningCollisions > 0) {
      throw new Error(`Anti-repetition failed: Found ${consecutiveOpeningCollisions} consecutive opening collisions!`);
    }

    let consecutiveSuspenseCollisions = 0;
    for (let i = 1; i < suspenseTypes.length; i++) {
      if (suspenseTypes[i] === suspenseTypes[i - 1] && suspenseTypes[i] !== '') {
        consecutiveSuspenseCollisions++;
      }
    }
    console.log(`   ✓ Consecutive Suspense Collisions: ${consecutiveSuspenseCollisions} (Expected: 0)`);
    if (consecutiveSuspenseCollisions > 0) {
      throw new Error(`Anti-repetition failed: Found ${consecutiveSuspenseCollisions} consecutive suspense collisions!`);
    }

    // =========================================================================
    // TEST 3: NARRATIVE ARCHETYPE ROTATION
    // =========================================================================
    console.log('\n3. Testing Narrative Archetype Variety...');
    const uniqueArchetypes = new Set(archetypes);
    console.log(`   ✓ Distinct Archetypes used across 20 chapters: ${uniqueArchetypes.size}/5 (${Array.from(uniqueArchetypes).join(', ')})`);
    if (uniqueArchetypes.size < 4) {
      throw new Error('Archetype diversity too low!');
    }

    // =========================================================================
    // TEST 4: SYMBOLIC DIVERSITY
    // =========================================================================
    console.log('\n4. Testing Symbolic Diversity...');
    const uniqueSymbols = new Set(symbolsUsed);
    console.log(`   ✓ Distinct Allegorical Symbols used: ${uniqueSymbols.size} (${Array.from(uniqueSymbols).slice(0, 4).join(', ')}...)`);
    if (uniqueSymbols.size < 3) {
      throw new Error('Symbolic variety too low!');
    }

    // =========================================================================
    // TEST 5: REPEATED EMOTIONAL INPUT (ANXIOUS SPAM RESILIENCE)
    // =========================================================================
    console.log('\n5. Testing Repeated Emotional Input (Anxiety/Stress Spam Resilience)...');
    const testUserSpam = `test-p8-spam-${Date.now()}`;

    // Seed 10 identical anxious check-ins
    for (let i = 0; i < 10; i++) {
      await sql`
        INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
        VALUES (${testUserSpam}, 'daily_check_in', 'daily-check-in', 'Anxious', 4, '["work"]'::jsonb);
      `;
    }

    const spamCh1 = await storyService.generateNextChapterForUser(testUserSpam);
    const spamCh2 = await storyService.generateNextChapterForUser(testUserSpam);

    console.log(`   ✓ Spam Ch 1 Title: "${spamCh1.chapter.title}", Archetype: "${spamCh1.chapter.metadata.archetype}"`);
    console.log(`   ✓ Spam Ch 2 Title: "${spamCh2.chapter.title}", Archetype: "${spamCh2.chapter.metadata.archetype}"`);

    // Verify stories do NOT literally parrot "The character felt anxious"
    const containsLiteralParrot = spamCh1.chapter.content.includes('felt anxious while working') ||
      spamCh2.chapter.content.includes('felt anxious while working');
    console.log(`   ✓ Literal parrot check: ${containsLiteralParrot ? 'FAILED' : 'PASSED (Subtle allegory used)'}`);
    if (containsLiteralParrot) {
      throw new Error('Literal emotional copying detected!');
    }

    // =========================================================================
    // TEST 6: DETERMINISTIC REPRODUCIBILITY ACROSS LONG ARCS
    // =========================================================================
    console.log('\n6. Testing Bit-for-Bit Deterministic Reproducibility on Long Arcs...');
    const ctx = await storyContextService.buildStoryContext(testUserLong);
    const state = await storyService.getStoryState(testUserLong);
    const history = await storyService.getStoryChapters(testUserLong, 5);

    const dryRun1 = await storyComposerService.composeNextChapter(ctx, state, history);
    const dryRun2 = await storyComposerService.composeNextChapter(ctx, state, history);

    const isIdentical = dryRun1.content === dryRun2.content && dryRun1.title === dryRun2.title;
    console.log(`   ✓ Content Equality: ${isIdentical}`);
    if (!isIdentical) {
      throw new Error('Deterministic reproducibility failed across runs!');
    }

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserLong}, ${testUserSpam});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserLong}, ${testUserSpam});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserLong}, ${testUserSpam});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserLong}, ${testUserSpam});`;

    console.log('\n✨ ALL PHASE 8 LONG-TERM STORY QUALITY & ANTI-REPETITION TESTS PASSED! ✨\n');
  } catch (err) {
    console.error('\n❌ Phase 8 Long-Term Verification Failed:', err);
    process.exit(1);
  }
}

runPhase8LongTermVariationTests();
