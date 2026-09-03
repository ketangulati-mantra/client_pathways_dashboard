export interface NarrativeCharacter {
  name: string;
  role: string;
  status: 'active' | 'departed' | 'mentioned';
}

export interface NarrativeLocation {
  name: string;
  significance: string;
}

export interface NarrativeSymbol {
  symbol: string;
  meaning: string;
}

export interface NarrativeFacts {
  characters: NarrativeCharacter[];
  locations: NarrativeLocation[];
  symbols: NarrativeSymbol[];
}

export interface StoryThread {
  id: string;
  text: string;
  status?: 'introduced' | 'developing' | 'escalating' | 'resolved' | 'open';
  introduced_in_chapter?: number;
  created_in_chapter?: number;
  last_advanced_in_chapter?: number;
  importance?: 'high' | 'medium' | 'subtle';
}

export const storyContinuityService = {
  /**
   * Merges and deduplicates persistent narrative facts within bounded memory limits.
   */
  mergeNarrativeFacts(
    current: NarrativeFacts = { characters: [], locations: [], symbols: [] },
    incoming?: Partial<NarrativeFacts>
  ): NarrativeFacts {
    const characters = [...(current.characters || [])];
    const locations = [...(current.locations || [])];
    const symbols = [...(current.symbols || [])];

    if (incoming?.characters && Array.isArray(incoming.characters)) {
      incoming.characters.forEach((inc) => {
        if (!inc || !inc.name) return;
        const idx = characters.findIndex((c) => c.name.toLowerCase() === inc.name.toLowerCase());
        if (idx >= 0) {
          characters[idx] = { ...characters[idx], ...inc };
        } else if (characters.length < 5) {
          characters.push({
            name: inc.name,
            role: inc.role || 'guide',
            status: inc.status || 'active'
          });
        }
      });
    }

    if (incoming?.locations && Array.isArray(incoming.locations)) {
      incoming.locations.forEach((inc) => {
        if (!inc || !inc.name) return;
        const idx = locations.findIndex((l) => l.name.toLowerCase() === inc.name.toLowerCase());
        if (idx >= 0) {
          locations[idx] = { ...locations[idx], ...inc };
        } else if (locations.length < 5) {
          locations.push({
            name: inc.name,
            significance: inc.significance || 'place of reflection'
          });
        }
      });
    }

    if (incoming?.symbols && Array.isArray(incoming.symbols)) {
      incoming.symbols.forEach((inc) => {
        if (!inc || !inc.symbol) return;
        const idx = symbols.findIndex((s) => s.symbol.toLowerCase() === inc.symbol.toLowerCase());
        if (idx >= 0) {
          symbols[idx] = { ...symbols[idx], ...inc };
        } else if (symbols.length < 5) {
          symbols.push({
            symbol: inc.symbol,
            meaning: inc.meaning || 'symbolic reflection'
          });
        }
      });
    }

    return {
      characters: characters.slice(0, 5),
      locations: locations.slice(0, 5),
      symbols: symbols.slice(0, 5)
    };
  },

  /**
   * Evolves the lifecycle of open threads, transitioning introduced -> developing -> escalating -> resolved.
   */
  evolveThreads(
    currentThreads: StoryThread[] = [],
    incomingThreads: StoryThread[] = [],
    currentChapterNumber: number
  ): StoryThread[] {
    const threadMap = new Map<string, StoryThread>();

    // 1. Load current threads
    currentThreads.forEach((t) => {
      threadMap.set(t.id || t.text, {
        id: t.id || `thread_${t.introduced_in_chapter || 1}`,
        text: t.text,
        status: t.status || 'introduced',
        introduced_in_chapter: t.introduced_in_chapter || 1,
        last_advanced_in_chapter: t.last_advanced_in_chapter,
        importance: t.importance || 'medium'
      });
    });

    // 2. Process incoming updates from the newly generated chapter
    incomingThreads.forEach((inc) => {
      if (!inc || !inc.text) return;
      const key = inc.id || inc.text;
      const existing = threadMap.get(key) || Array.from(threadMap.values()).find(
        (t) => t.text.toLowerCase().includes(inc.text.toLowerCase()) || inc.text.toLowerCase().includes(t.text.toLowerCase())
      );

      if (existing) {
        // Advance lifecycle
        existing.status = inc.status || existing.status;
        existing.last_advanced_in_chapter = currentChapterNumber;
        if (inc.text) existing.text = inc.text;
        if (inc.importance) existing.importance = inc.importance;
      } else {
        // New thread introduced
        threadMap.set(key, {
          id: inc.id || `thread_${currentChapterNumber}_${threadMap.size + 1}`,
          text: inc.text,
          status: inc.status || 'introduced',
          introduced_in_chapter: currentChapterNumber,
          last_advanced_in_chapter: currentChapterNumber,
          importance: inc.importance || 'medium'
        });
      }
    });

    // 3. Filter and retain: active open/developing/escalating threads, plus recently resolved ones
    const all = Array.from(threadMap.values());
    const active = all.filter((t) => t.status !== 'resolved');
    const resolved = all.filter((t) => t.status === 'resolved');

    // Keep max 3 active threads, and max 1 recent resolved for context
    const finalThreads = [...active.slice(0, 3), ...resolved.slice(-1)];
    return finalThreads;
  },

  /**
   * Formats persistent facts and active threads for the Gemini prompt packet.
   */
  formatContinuityPacket(facts: NarrativeFacts, threads: StoryThread[]): string {
    const charsList = (facts?.characters || []).map((c) => `- ${c.name} (${c.role}, status: ${c.status})`).join('\n');
    const locsList = (facts?.locations || []).map((l) => `- ${l.name} (${l.significance})`).join('\n');
    const symsList = (facts?.symbols || []).map((s) => `- ${s.symbol}: ${s.meaning}`).join('\n');

    const threadsList = (threads || [])
      .map((t) => `- [${(t.status || 'open').toUpperCase()}] ${t.text} (Introduced Ch ${t.introduced_in_chapter || t.created_in_chapter || 1}, Importance: ${t.importance || 'medium'})`)
      .join('\n');

    return `
=== PERSISTENT NARRATIVE CONTINUITY & FACTS ===
Characters:
${charsList || '- Protagonist (Second-person "You")'}

Key Locations:
${locsList || '- The unfolding realm'}

Recurring Symbols:
${symsList || '- The guiding path'}

=== OPEN NARRATIVE THREADS & MYSTERIES ===
${threadsList || '- Introduce 1 subtle, compelling mystery in this chapter.'}
`;
  }
};
