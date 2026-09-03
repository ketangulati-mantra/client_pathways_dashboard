/**
 * Journal Entry Formatting & Content Sanitization Service
 * Ensures data integrity by separating:
 * - Reflection type
 * - Original prompt/question (ensures 0 duplicate rendering)
 * - Check-in context
 * - User's authentic written reflection (stripping raw markdown syntax, filtering placeholder N/A values)
 * - Date and timestamp metadata
 */

export function getMoodColor(emotion) {
  const e = (emotion || '').toLowerCase();
  if (['overwhelmed', 'anxious', 'stressed', 'frustrated', 'angry', 'panicked', 'panic', 'alarmed', 'terrified', 'fearful'].includes(e)) {
    return '#E11D48'; // Rose
  }
  if (['sad', 'lonely', 'tired', 'drained', 'exhausted', 'low', 'discouraged', 'hurt'].includes(e)) {
    return '#2563EB'; // Blue
  }
  if (['calm', 'peaceful', 'relaxed', 'content', 'grounded', 'serene'].includes(e)) {
    return '#059669'; // Emerald
  }
  if (['happy', 'joyful', 'good', 'excited', 'proud', 'grateful', 'inspired', 'optimistic', 'relieved', 'safe', 'motivated'].includes(e)) {
    return '#D97706'; // Amber
  }
  return '#7C3AED'; // Purple default
}

export function getEntryTypeMeta(entryType) {
  if (entryType === 'reflect_today') {
    return {
      label: 'REFLECT ON TODAY',
      accentColor: '#B45309',
      bgColor: '#FAF3E8',
      borderColor: '#EFE2CE'
    };
  }
  if (entryType === 'guided_prompt') {
    return {
      label: 'GUIDED REFLECTION',
      accentColor: '#7C3AED',
      bgColor: '#F5F1FA',
      borderColor: '#E8E0F2'
    };
  }
  return {
    label: 'FREE WRITE',
    accentColor: '#0F766E',
    bgColor: '#EDF7F6',
    borderColor: '#D5ECE9'
  };
}

/**
 * Checks if a string contains genuine written reflection text rather than placeholder values.
 */
export function isMeaningfulUserText(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = normalized.split(' ').filter(Boolean);
  
  // If all tokens are placeholder words, return false
  const placeholderTokens = ['na', 'none', 'null', 'undefined', 'nil', 'no', 'nope', 'test', 'sample', 'n', 'a'];
  if (tokens.length > 0 && tokens.every(t => placeholderTokens.includes(t))) {
    return false;
  }

  const lower = trimmed.toLowerCase();
  if (['na', 'n/a', 'none', 'null', 'undefined', 'nil', '-', '--', 'n.a.', 'n.a', 'no', 'nope', 'na na na', 'na na'].includes(lower)) {
    return false;
  }
  return true;
}

/**
 * Strips raw markdown headings (e.g. ### Question) and formatting to return clean text.
 */
export function cleanRawMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^###\s+.*$/gm, '') // Remove ### heading lines
    .replace(/^##\s+.*$/gm, '')  // Remove ## heading lines
    .replace(/^#\s+.*$/gm, '')   // Remove # heading lines
    .replace(/[*_~`]/g, '')       // Remove inline markdown markers
    .replace(/\n{3,}/g, '\n\n')  // Collapse multiple newlines
    .trim();
}

/**
 * Formats relative date (Today, Yesterday, X days ago, or Month Day)
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = today.getTime() - entryDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats full date (e.g. "Tuesday, September 1, 2026")
 */
export function formatFullDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Extracts clean structured display data from a raw journal entry record.
 */
export function extractEntryDisplay(entry) {
  if (!entry) {
    return {
      displayTitle: 'Untitled Reflection',
      originalPrompt: null,
      userSnippet: '',
      userFullText: '',
      hasMeaningfulResponse: false,
      structuredPrompts: null,
      typeMeta: getEntryTypeMeta('free_write'),
      emotion: null,
      emotionColor: '#7C3AED',
      relativeDate: '',
      fullDate: ''
    };
  }

  const typeMeta = getEntryTypeMeta(entry.entry_type);
  const isReflectToday = entry.entry_type === 'reflect_today';
  const isGuidedPrompt = entry.entry_type === 'guided_prompt';

  // 1. Extract original prompt / question (avoiding duplicate text with title)
  let originalPrompt = null;
  if (isGuidedPrompt) {
    originalPrompt = entry.metadata?.prompt || (entry.title && !entry.title.startsWith('Reflecting') ? entry.title : null);
  }

  // 2. Structured multi-step prompts (Reflect on Today)
  let structuredPrompts = null;
  if (isReflectToday && Array.isArray(entry.metadata?.prompts) && entry.metadata.prompts.length > 0) {
    structuredPrompts = entry.metadata.prompts
      .map((p) => ({
        step: p.step,
        title: p.title || `Step ${p.step || ''}`,
        prompt: p.prompt || '',
        response: (p.response || '').trim()
      }))
      .filter((p) => isMeaningfulUserText(p.response));
  }

  // 3. User's actual response text
  let userFullText = '';
  if (structuredPrompts && structuredPrompts.length > 0) {
    userFullText = structuredPrompts.map((p) => p.response).join('\n\n');
  } else if (entry.content) {
    // Strip markdown headers like ### Prompt to isolate user text
    const cleaned = cleanRawMarkdown(entry.content);
    if (isMeaningfulUserText(cleaned)) {
      userFullText = cleaned;
    }
  }

  const hasMeaningfulResponse = isMeaningfulUserText(userFullText);
  if (!hasMeaningfulResponse) {
    userFullText = '';
  }

  // 4. Clean 2-line snippet preview (pure text, no markdown headers, no placeholders)
  let userSnippet = '';
  if (hasMeaningfulResponse) {
    if (structuredPrompts && structuredPrompts.length > 0) {
      userSnippet = structuredPrompts[0].response;
    } else {
      userSnippet = userFullText;
    }
    userSnippet = userSnippet.replace(/\n+/g, ' ').trim();
  }

  // 5. Display title (ensuring no duplicate prompt rendering)
  let displayTitle = entry.title || 'Untitled Reflection';
  displayTitle = displayTitle.replace(/^###\s+/, '').trim();

  // If guided reflection and title is identical to prompt, harmonize them
  if (isGuidedPrompt && originalPrompt && displayTitle === originalPrompt) {
    displayTitle = originalPrompt;
  }

  // 6. Metadata
  const emotion = entry.emotion || null;
  const emotionColor = getMoodColor(emotion);
  const relativeDate = formatRelativeDate(entry.created_at || entry.date);
  const fullDate = formatFullDate(entry.created_at || entry.date);

  return {
    displayTitle,
    originalPrompt,
    userSnippet,
    userFullText,
    hasMeaningfulResponse,
    structuredPrompts,
    typeMeta,
    emotion,
    emotionColor,
    relativeDate,
    fullDate
  };
}
