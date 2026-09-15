/**
 * snapshotInsightEngine.js
 * 
 * Generates an identity-driven personal insight statement and human reflection
 * based on selected emotion, core family, context selections, and intensity.
 * 
 * Aesthetic: 80% sophisticated editorial, 20% playful contemporary personality card.
 * Uses clean Lucide icons (Eye, Sparkles, Compass) instead of OS emojis.
 */

export function deriveSnapshotIdentity({
  emotionName = 'Provoked',
  familyName = 'Anger',
  intensity = 3,
  selectedContexts = [],
  selectedNeeds = []
}) {
  const normFam = (familyName || 'Anger').toLowerCase();
  const normEmo = (emotionName || 'Provoked').toLowerCase();
  const contextStr = (selectedContexts || []).join(' ').toLowerCase();

  // 1. ANGER FAMILY
  if (normFam.includes('anger') || normFam.includes('rage') || normFam.includes('frustrat')) {
    if (contextStr.includes('boundary') || contextStr.includes('corner') || contextStr.includes('limit')) {
      return {
        vibeTag: 'okay... this says something',
        identityStatement: 'RESPECT MATTERS.\nLIKE, A LOT.',
        reflectionBody:
          "You notice when you're not being heard. And when something crosses a boundary, it's hard to simply brush it off.",
        takeThisWithYou:
          "You can stand up for what matters without reacting in the moment."
      };
    }
    if (contextStr.includes('disrespect') || contextStr.includes('unheard') || contextStr.includes('attack')) {
      return {
        vibeTag: 'under the surface',
        identityStatement: "YOU DON'T DO\nDISRESPECT LIGHTLY.",
        reflectionBody:
          "Being heard and acknowledged matters to you. When it doesn't happen, you feel it — and you don't pretend otherwise.",
        takeThisWithYou:
          "Your presence has weight. You don't have to defend your right to feel this."
      };
    }
    if (contextStr.includes('unfair') || contextStr.includes('control')) {
      return {
        vibeTag: 'noted',
        identityStatement: 'FAIRNESS IS NON-NEGOTIABLE FOR YOU.',
        reflectionBody:
          "When things feel out of balance or unjust, you can't just un-see it. You care deeply about things being right.",
        takeThisWithYou:
          "You don’t have to fix every broken scale today. Protect your peace first."
      };
    }
    // Default Anger
    return {
      vibeTag: 'okay... this tracks',
      identityStatement: 'RESPECT MATTERS.\nLIKE, A LOT.',
      reflectionBody:
        "When something feels crossed, you feel it. Being heard matters to you — and you don't pretend otherwise.",
      takeThisWithYou:
        "You can honour what matters without reacting in the immediate moment."
    };
  }

  // 2. SADNESS FAMILY
  if (normFam.includes('sad') || normFam.includes('grief') || normFam.includes('hurt') || normFam.includes('lonel')) {
    if (contextStr.includes('miss') || contextStr.includes('loss') || normEmo.includes('nostalgic')) {
      return {
        vibeTag: 'yeah. this hit.',
        identityStatement: 'YOU FORM DEEP\nCONNECTIONS.',
        reflectionBody:
          "You don't do surface-level attachment. When someone or something matters to you, it leaves a lasting impression.",
        takeThisWithYou:
          "Sadness is proof that something held genuine meaning. Be gentle with that open heart."
      };
    }
    if (contextStr.includes('alone') || contextStr.includes('disconnected') || contextStr.includes('left_out')) {
      return {
        vibeTag: 'under the surface',
        identityStatement: 'CONNECTION IS A\nBIG DEAL FOR YOU.',
        reflectionBody:
          "Carrying everything alone feels heavy because you crave real, resonant presence. You don't do half-hearted connection.",
        takeThisWithYou:
          "You don’t have to carry every heavy thing alone. It is okay to take today slowly."
      };
    }
    return {
      vibeTag: 'okay... this tracks',
      identityStatement: 'YOU FEEL THINGS\nDEEPLY.',
      reflectionBody:
        "You don't brush past what hurts. Your capacity to sit with emotional depth shows real strength and an open heart.",
      takeThisWithYou:
        "Take today at your own pace. Moving softly is still moving forward."
    };
  }

  // 3. FEAR / ANXIETY FAMILY
  if (normFam.includes('fear') || normFam.includes('anxious') || normFam.includes('worry')) {
    if (contextStr.includes('control') || contextStr.includes('mistake') || contextStr.includes('judged')) {
      return {
        vibeTag: 'okay... this says something',
        identityStatement: 'YOU CARE ABOUT\nGETTING THINGS RIGHT.',
        reflectionBody:
          "The pressure you feel comes from high standards and wanting to show up well. You care more than you let on.",
        takeThisWithYou:
          "You don't have to be perfect to be worthy of safety and ease."
      };
    }
    return {
      vibeTag: 'under the surface',
      identityStatement: 'YOU LIKE KNOWING\nWHERE YOU STAND.',
      reflectionBody:
        "Uncertainty is heavy because you value clarity and preparation. Your mind scans ahead because you care about what happens next.",
      takeThisWithYou:
        "You don't have to figure out the whole future today. Just this present step."
    };
  }

  // 4. LOVE FAMILY
  if (normFam.includes('love') || normFam.includes('tender') || normFam.includes('warm')) {
    return {
      vibeTag: 'yeah. this tracks',
      identityStatement: 'YOU DON’T DO\nHALF-HEARTED LOVE.',
      reflectionBody:
        "You have a natural ability to cherish the people and moments that anchor you. Genuine warmth is your natural state.",
      takeThisWithYou:
        "Connection is an anchor. Let yourself fully receive and enjoy this warmth."
    };
  }

  // 5. JOY FAMILY
  if (normFam.includes('joy') || normFam.includes('happy') || normFam.includes('grat')) {
    return {
      vibeTag: 'noted',
      identityStatement: 'YOU COME ALIVE\nWHEN YOU PROGRESS.',
      reflectionBody:
        "You notice the light in small moments. Letting yourself celebrate momentum is how you replenish your energy.",
      takeThisWithYou:
        "Let yourself enjoy this light. You deserve to experience ease and joy."
    };
  }

  // 6. SURPRISE / DEFAULT
  return {
    vibeTag: 'okay... this says something',
    identityStatement: 'WHEN SOMETHING MATTERS,\nYOU FEEL IT.',
    reflectionBody:
      "When unexpected turns arise, you give yourself room to notice what shifted. You value real clarity and honesty.",
    takeThisWithYou:
      "You don't need all the answers right now. Giving yourself space is enough."
  };
}
