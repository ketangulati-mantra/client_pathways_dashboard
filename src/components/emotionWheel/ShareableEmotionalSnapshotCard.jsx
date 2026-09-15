import React from 'react';
import SnapshotAbstractArt from './SnapshotAbstractArt';
import { deriveSnapshotIdentity } from './snapshotInsightEngine';

/**
 * ShareableEmotionalSnapshotCard: Gen Z / Millennial Editorial Instagram Story Artifact (approx 9:16).
 * 
 * CORE VISUAL & IDENTITY HIERARCHY:
 * 1. Top Bar: Official TherapyMantra Icon + "TODAY'S DISCOVERY"
 * 2. Emotion Hero: "PROVOKED" (dramatically large) + "ANGER · 3/5"
 * 3. Abstract Blue Emotional Artwork (stacked cleanly behind)
 * 4. Contemporary vibe tag: "okay... this says something" + eyes icon
 * 5. Centerpiece Statement: "RESPECT MATTERS. LIKE, A LOT." (Large, personal, identity-driven)
 * 6. Short human reflection: "You notice when you're not being heard..." (< 35 words)
 * 7. "TAKE THIS WITH YOU": Actionable grounding thought
 * 8. Signature Footer: "Your feelings have stories." + Official TherapyMantra Logo (38px)
 */
export default React.forwardRef(function ShareableEmotionalSnapshotCard(
  { emotion, family, intensity = 3, selectedContexts = [], selectedNeeds = [] },
  ref
) {
  const emotionName = emotion?.name || 'Provoked';
  const familyName = family?.name || 'Anger';

  // Compute the contemporary personality insight
  const { vibeTag, identityStatement, reflectionBody, takeThisWithYou } =
    deriveSnapshotIdentity({
      emotionName,
      familyName,
      intensity,
      selectedContexts,
      selectedNeeds
    });

  const iconUrl =
    'https://res.cloudinary.com/hxbamdqf/image/upload/v1785828110/therapymantraIcon_kie5d3.png';

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '340px',
        aspectRatio: '9 / 16',
        maxHeight: 'min(600px, 76vh)',
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow:
          '0 28px 75px -14px rgba(15, 23, 42, 0.16), 0 0 35px rgba(56, 189, 248, 0.14)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(20px, 3.8vh, 28px) clamp(18px, 5vw, 24px)',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        contain: 'paint',
        color: '#0f172a',
        fontFamily:
          '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* 1. Abstract Background Artwork Layer */}
      <SnapshotAbstractArt familyName={familyName} />

      {/* 2. Top Header with Small Brand Icon */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px'
          }}
        >
          <img
            src={iconUrl}
            alt="TherapyMantra Icon"
            style={{
              height: '18px',
              width: '18px',
              display: 'block',
              objectFit: 'contain'
            }}
            crossOrigin="anonymous"
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0284c7',
              textTransform: 'uppercase',
              letterSpacing: '0.2em'
            }}
          >
            Today's Discovery
          </span>
        </div>
        <div
          style={{
            width: '24px',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent, #0284c7, transparent)'
          }}
        />
      </div>

      {/* 3. Emotion Hero Header & Parent Family / Rating */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          marginTop: '2px'
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(34px, 9vw, 46px)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            margin: '0 0 6px 0',
            textTransform: 'uppercase'
          }}
        >
          {emotionName}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#0369a1',
              letterSpacing: '0.14em',
              textTransform: 'uppercase'
            }}
          >
            {familyName}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>•</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0284c7',
              letterSpacing: '0.04em'
            }}
          >
            {intensity} / 5
          </span>
        </div>
      </div>

      {/* 4. Centerpiece Identity Insight ("What this says about me") */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          padding: '0 2px'
        }}
      >
        {/* Subtle contemporary vibe tag with supplied eyes icon */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px'
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#0284c7',
              letterSpacing: '0.02em'
            }}
          >
            {vibeTag}
          </span>
          <img
            src="https://res.cloudinary.com/hxbamdqf/image/upload/v1789455953/eyes_dgzlum.png"
            alt="Eyes"
            style={{
              height: '20px',
              width: '20px',
              display: 'block',
              objectFit: 'contain'
            }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Large editorial personal statement (Dominant Centerpiece) */}
        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: 'clamp(18px, 4.8vw, 22px)',
            fontWeight: 900,
            color: '#0369a1',
            lineHeight: 1.22,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'pre-line'
          }}
        >
          {identityStatement}
        </h2>

        {/* Short, human narrative body (< 35 words) */}
        <p
          style={{
            margin: '0 0 14px 0',
            fontSize: '13px',
            fontWeight: 500,
            color: '#334155',
            lineHeight: 1.48,
            maxWidth: '280px'
          }}
        >
          {reflectionBody}
        </p>

        {/* Actionable Grounding Thought */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '4px'
            }}
          >
            Take this with you
          </span>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#475569',
              lineHeight: 1.42,
              maxWidth: '260px'
            }}
          >
            "{takeThisWithYou}"
          </p>
        </div>
      </div>

      {/* 5. Footer: Signature TherapyMantra Logo & Viral Curiosity Hook */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          borderTop: '1px solid rgba(226, 232, 240, 0.85)',
          paddingTop: '10px',
          gap: '8px'
        }}
      >
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#0369a1',
            letterSpacing: '0.04em'
          }}
        >
          Your feelings have stories.
        </span>

        {/* Official TherapyMantra Brand Signature Logo (Big & Crisp) */}
        <img
          src={iconUrl}
          alt="TherapyMantra"
          style={{
            height: '38px',
            maxWidth: '160px',
            width: 'auto',
            display: 'block',
            objectFit: 'contain'
          }}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
});

