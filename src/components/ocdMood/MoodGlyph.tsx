import React from 'react';

interface MoodGlyphProps {
  level: number; // 1 | 2 | 3 | 4 | 5
  isSelected?: boolean;
  size?: number;
}

/**
 * Organic, abstract mood glyphs designed with refined editorial geometry.
 * Clean, non-childish, serene line-work with gentle curvature.
 */
export default function MoodGlyph({ level, isSelected = false, size = 48 }: MoodGlyphProps) {
  const strokeColor = isSelected ? '#005387' : '#64748B';
  const fillColor = isSelected ? '#E0F2FE' : '#F8FAFC';
  const accentColor = isSelected ? '#0284C7' : '#94A3B8';

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s ease'
      }}
    >
      <svg
        viewBox="0 0 48 48"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient Ring */}
        <circle
          cx="24"
          cy="24"
          r="21"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isSelected ? '2' : '1.5'}
        />

        {/* Eyes (Refined subtle dots) */}
        <circle cx="17" cy="20" r="2.2" fill={strokeColor} />
        <circle cx="31" cy="20" r="2.2" fill={strokeColor} />

        {/* Mouth curve based on mood level */}
        {level === 1 && (
          // Level 1: Very Low - Downward gentle arch
          <path
            d="M17 32 Q24 25 31 32"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {level === 2 && (
          // Level 2: Low - Subdued slight slope
          <path
            d="M17 31 Q24 28 31 30"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {level === 3 && (
          // Level 3: Okay - Calm neutral horizontal line with soft center
          <path
            d="M17 29 L31 29"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {level === 4 && (
          // Level 4: Good - Soft upward crescent
          <path
            d="M17 28 Q24 34 31 28"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {level === 5 && (
          // Level 5: Very Good - Warm wide crescent
          <path
            d="M16 27 Q24 37 32 27"
            stroke={accentColor}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
