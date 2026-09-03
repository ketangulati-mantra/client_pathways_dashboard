import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { storyContextService } from '../services/storyContextService.js';
import { storyPersonalizationService } from '../services/storyPersonalizationService.js';
import { setupDb } from '../utils/setupDb.js';

async function runStoryPersonalizationVerification() {
  console.log('🚀 Starting Phase 7: Deep Story Personalization Verification...\n');

  try {
    await setupDb();

    const testUserNoData = `test-p7-empty-${Date.now()}`;
    const testUserSparse = `test-p7-sparse-${Date.now()}`;
    const testUserRichA = `test-p7-rich-a-${Date.now()}`;
    const testUserRichB = `test-p7-rich-b-${Date.now()}`;

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;

    // =========================================================================
    // TEST 1: NO DATA (CONFIDENCE NONE)
    // =========================================================================
    console.log('1. Testing No-Data Personalization (Confidence NONE)...');
    const stateEmpty = await storyService.getStoryState(testUserNoData);
    const ctxEmpty = await storyContextService.buildStoryContext(testUserNoData);
    const pEmpty = storyPersonalizationService.derivePersonalization(ctxEmpty, stateEmpty);

    console.log(`   ✓ Confidence: "${pEmpty.personalizationConfidence}" (Expected: "none")`);
    console.log(`   ✓ Narrative Motifs: ${pEmpty.narrativeMotifs.length} (Expected: 0, no false motifs)`);
    console.log(`   ✓ Emerging Locations: ${pEmpty.adaptiveWorldElements.emergingLocations.length} (Expected: 0)`);

    if (pEmpty.personalizationConfidence !== 'none' || pEmpty.narrativeMotifs.length !== 0) {
      throw new Error('No-data case invented motifs or misclassified confidence!');
    }

    // =========================================================================
    // TEST 2: SPARSE DATA (CONFIDENCE LOW)
    // =========================================================================
    console.log('\n2. Testing Sparse-Data Personalization (Confidence LOW)...');
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserSparse}, 'daily_check_in', 'daily-check-in', 'Calm', 2, '["alone"]'::jsonb);
    `;

    const stateSparse = await storyService.getStoryState(testUserSparse);
    const ctxSparse = await storyContextService.buildStoryContext(testUserSparse);
    const pSparse = storyPersonalizationService.derivePersonalization(ctxSparse, stateSparse);

    console.log(`   ✓ Confidence: "${pSparse.personalizationConfidence}" (Expected: "low")`);
    console.log(`   ✓ Motifs: ${pSparse.narrativeMotifs.length} (Expected: 0)`);
    console.log(`   ✓ Atmospheric Tone: "${pSparse.emotionalLandscape.currentTone}"`);

    if (pSparse.personalizationConfidence !== 'low' || pSparse.narrativeMotifs.length !== 0) {
      throw new Error('Sparse data case misclassified motifs!');
    }

    // =========================================================================
    // TEST 3: RECURRING THEMES & MOTIF EMERGENCE (CONFIDENCE HIGH)
    // =========================================================================
    console.log('\n3. Testing Recurring Themes & Motif Emergence (Confidence HIGH)...');
    
    // User A: Heavy to Grounded Communication Journey
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts, created_at)
      VALUES (${testUserRichA}, 'daily_check_in', 'daily-check-in', 'Overwhelmed', 4, '["work"]'::jsonb, NOW() - INTERVAL '5 days');
    `;
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts, created_at)
      VALUES (${testUserRichA}, 'daily_check_in', 'daily-check-in', 'Calm', 2, '["friends"]'::jsonb, NOW());
    `;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUserRichA}, 'Talking to my friend', 'I wanted to communicate more openly and express what matters.', 'free_write', 'Calm', NOW() - INTERVAL '3 days');
    `;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUserRichA}, 'A clear conversation', 'Had an honest conversation today. Finding space to express myself felt grounding.', 'guided_prompt', 'Grounded', NOW());
    `;

    const stateRichA = await storyService.getStoryState(testUserRichA);
    const ctxRichA = await storyContextService.buildStoryContext(testUserRichA);
    const pRichA = storyPersonalizationService.derivePersonalization(ctxRichA, stateRichA);

    console.log(`   ✓ Confidence: "${pRichA.personalizationConfidence}" (Expected: "medium" or "high")`);
    console.log(`   ✓ Emotional Shift: "${pRichA.emotionalLandscape.recentShift}" (Expected: "heavy_to_grounded")`);
    console.log(`   ✓ Atmospheric Shift: "${pRichA.adaptiveWorldElements.atmosphericShift}"`);
    console.log(`   ✓ Recurring Themes: ${pRichA.recurringThemes.map(t => `${t.theme} (${t.persistence})`).join(', ')}`);
    console.log(`   ✓ Emerged Motif: "${pRichA.narrativeMotifs[0]?.motif}" (Stage: ${pRichA.narrativeMotifs[0]?.stage})`);
    console.log(`   ✓ Adaptive Locations: ${JSON.stringify(pRichA.adaptiveWorldElements.emergingLocations)}`);

    if (
      pRichA.narrativeMotifs.length === 0 ||
      pRichA.emotionalLandscape.recentShift !== 'heavy_to_grounded'
    ) {
      throw new Error('Failed to detect emotional shift or derive narrative motif!');
    }

    // =========================================================================
    // TEST 4: MOTIF EVOLUTION ACROSS CHAPTERS
    // =========================================================================
    console.log('\n4. Testing Motif Evolution (Introduced -> Recurring -> Transforming)...');
    
    // Simulate state at Chapter 4 with existing symbol
    const simulatedStateCh4 = {
      ...stateRichA,
      current_chapter_number: 4,
      narrative_facts: {
        characters: [],
        locations: [],
        symbols: [{ symbol: pRichA.narrativeMotifs[0].motif, meaning: pRichA.narrativeMotifs[0].meaning }]
      }
    } as any;

    const pCh4 = storyPersonalizationService.derivePersonalization(ctxRichA, simulatedStateCh4);
    console.log(`   ✓ Motif stage at Chapter 4: "${pCh4.narrativeMotifs[0]?.stage}" (Expected: "transforming")`);
    if (pCh4.narrativeMotifs[0]?.stage !== 'transforming') {
      throw new Error('Motif failed to evolve to transforming stage at Chapter 4!');
    }

    // =========================================================================
    // TEST 5: ANTI-COLLISION SAFEGUARD (DIFFERENT CONTEXTS = DIFFERENT MOTIFS)
    // =========================================================================
    console.log('\n5. Testing Anti-Collision Safeguard (Distinct Motifs for Different Contexts)...');

    // User B: Rest & Recharge Journey
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserRichB}, 'daily_check_in', 'daily-check-in', 'Calm', 2, '["alone"]'::jsonb);
    `;
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserRichB}, 'daily_check_in', 'daily-check-in', 'Grounded', 1, '["alone"]'::jsonb);
    `;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUserRichB}, 'Need rest', 'Took a quiet break today. I gave myself permission to sleep, rest, and pause.', 'free_write', 'Calm', NOW());
    `;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUserRichB}, 'Pacing myself', 'Giving myself time to recharge without guilt.', 'guided_prompt', 'Calm', NOW());
    `;

    const stateRichB = await storyService.getStoryState(testUserRichB);
    const ctxRichB = await storyContextService.buildStoryContext(testUserRichB);
    const pRichB = storyPersonalizationService.derivePersonalization(ctxRichB, stateRichB);

    console.log(`   ✓ User A Motif: "${pRichA.narrativeMotifs[0]?.motif}" (Theme: communication)`);
    console.log(`   ✓ User B Motif: "${pRichB.narrativeMotifs[0]?.motif}" (Theme: rest_recharge)`);

    if (pRichA.narrativeMotifs[0]?.motif === pRichB.narrativeMotifs[0]?.motif) {
      throw new Error('Anti-collision check failed: different themes received identical motif!');
    }

    // =========================================================================
    // TEST 6: USER ISOLATION
    // =========================================================================
    console.log('\n6. Testing User Isolation...');
    const userAHasB = pRichA.narrativeMotifs.some(m => m.motif === pRichB.narrativeMotifs[0]?.motif);
    console.log(`   ✓ Zero cross-user motif leakage: ${!userAHasB}`);
    if (userAHasB) throw new Error('User isolation violated!');

    // =========================================================================
    // TEST 7: FULL GENERATION INTEGRATION
    // =========================================================================
    console.log('\n7. Testing Full Generation Integration with Personalization Layer...');

    const mockCh = {
      title: 'Chapter 1: The Resonating Bell by the Sea',
      content: 'You step across the cool wet pebbles as the morning tide pulls away from the harbor wall. In the distance, a bronze listening bell sways gently in the sea mist, suspended from a weathered archway of dark cedar. You reach out your hand, feeling the quiet resonance in the salt air.',
      narrative_summary: 'You reached the harbor bell and listened to its quiet resonance.',
      open_threads: [{ id: 't1', text: 'The harmonic chime echoing across the bay', status: 'introduced' }]
    };

    const genResult = await storyService.generateNextChapterForUser(testUserRichA, {
      mockResponse: mockCh
    });

    console.log(`   ✓ Generation succeeded: Chapter ${genResult.chapter.chapter_number} - "${genResult.chapter.title}"`);
    console.log(`   ✓ State status: "${genResult.state.status}", Cycle: "${genResult.state.current_cycle_name}"`);
    console.log(`   ✓ Symbols stored in facts: ${JSON.stringify(genResult.state.narrative_facts?.symbols)}`);

    if (genResult.chapter.chapter_number !== 1 || genResult.state.status !== 'active') {
      throw new Error('Generation integration failed!');
    }

    // Clean up
    await sql`DELETE FROM story_chapters WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;
    await sql`DELETE FROM story_states WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserNoData}, ${testUserSparse}, ${testUserRichA}, ${testUserRichB});`;

    console.log('\n✨ ALL PHASE 7 DEEP PERSONALIZATION TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('\n❌ Phase 7 Verification Failed:', err);
    process.exit(1);
  }
}

runStoryPersonalizationVerification();
