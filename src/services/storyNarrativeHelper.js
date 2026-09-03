/**
 * Helper utilities for formatting and presenting narrative elements gently in the UI.
 */

// Atmospheric world descriptions based on cycle and theme
export function getAtmosphericWorldSubtitle(cycleId, worldTheme) {
  switch (cycleId) {
    case 'highland_observatory':
      return 'The mountain wind carries quiet starlight through the pine ridge.';
    case 'coastal_haven':
      return 'The tide rests softly along the harbor stones.';
    case 'botanical_archives':
      return 'Soft morning light filters through the rain-washed glass domes.';
    case 'desert_wind_towers':
      return 'Cool subterranean springs whisper beneath the sandstone towers.';
    case 'artisan_valley':
      return 'Paper lanterns sway gently above the river stone bridges.';
    default:
      if (worldTheme && typeof worldTheme === 'string') {
        return `A quiet realm of ${worldTheme.replace(/_/g, ' ')}.`;
      }
      return 'A quiet, unfolding journey shaped by your reflections.';
  }
}

// Atmospheric badge title for header/cycle representation
export function getAtmosphericCycleBadge(cycleId, cycleName) {
  if (cycleName && typeof cycleName === 'string') return cycleName;
  switch (cycleId) {
    case 'highland_observatory':
      return 'The Mountain of Echoes';
    case 'coastal_haven':
      return 'The Lighthouse of Quiet Correspondence';
    case 'botanical_archives':
      return 'The Sunken Greenhouse';
    case 'desert_wind_towers':
      return 'The Whispering Dunes';
    case 'artisan_valley':
      return 'The Glade of Apprentices';
    default:
      return 'The Evolving Realm';
  }
}

// Transforms internal open thread descriptions into elegant reader-facing continuation hints
export function formatReaderUnresolvedHint(thread, chapterNumber) {
  if (!thread || !thread.text) {
    return 'The horizon holds quiet mysteries yet to be explored.';
  }

  const raw = thread.text.trim();

  // If text already sounds poetic, refine it gently
  if (raw.toLowerCase().startsWith('the mystery of ')) {
    const topic = raw.slice('the mystery of '.length);
    return `The question of ${topic} remains softly unanswered.`;
  }

  if (raw.toLowerCase().startsWith('the ')) {
    return `${raw} continues to echo in the quiet air.`;
  }

  return `Something about ${raw} still waits to unfold.`;
}

// Get gentle cycle chapter progress label
export function getCycleProgressionLabel(chapterNumber) {
  if (chapterNumber === 1) return 'Beginning the Journey';
  if (chapterNumber === 2) return 'Finding the First Path';
  if (chapterNumber === 3) return 'Into the Deeper Realm';
  if (chapterNumber >= 4) return 'The Unfolding Chronicle';
  return 'Unfolding';
}
