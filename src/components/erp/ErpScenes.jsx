import React from 'react';

/**
 * Clean, organic SVG illustration for Scenario 1:
 * Person standing outside their home door, looking back at the door lock.
 */
export function HouseDoorScene({ state = 'trigger' }) {
  // state: 'trigger' | 'check' | 'relief' | 'doubt' | 'exposure' | 'prevention'
  return (
    <div className="erp-scene-illustration">
      <svg viewBox="0 0 260 135" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ground */}
        <line x1="10" y1="120" x2="250" y2="120" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

        {/* House / Doorway on left */}
        <rect x="20" y="25" width="60" height="95" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
        <rect x="30" y="40" width="40" height="80" rx="2" fill="#FFFFFF" stroke="#005387" strokeWidth="1.8" />
        
        {/* Door handle / lock */}
        <circle cx="62" cy="80" r="3.5" fill={state === 'check' ? '#0284C7' : '#005387'} />
        {state === 'check' && (
          <circle cx="62" cy="80" r="8" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
        )}

        {/* Walkway dashes */}
        <line x1="80" y1="120" x2="185" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />

        {/* Person standing on right, looking back toward house */}
        <g transform="translate(195, 42)">
          {/* Head */}
          <circle cx="15" cy="12" r="8.5" fill="#18243A" />
          {/* Body */}
          <path d="M15 20 V54 M7 33 H23" stroke="#18243A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Legs */}
          <path d="M15 54 L8 78 M15 54 L22 78" stroke="#18243A" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Dynamic Thought / State Cue */}
        {state === 'trigger' && (
          <g transform="translate(92, 16)">
            <rect x="0" y="0" width="102" height="30" rx="8" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.4" />
            <text x="51" y="19" fill="#005387" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
              Lock the door?
            </text>
            <circle cx="94" cy="35" r="2.5" fill="#0284C7" />
          </g>
        )}

        {state === 'check' && (
          <g transform="translate(85, 16)">
            <path d="M120 50 Q80 35 45 68" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" fill="none" />
            <rect x="0" y="0" width="88" height="28" rx="7" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.4" />
            <text x="44" y="18" fill="#0369A1" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
              Checking...
            </text>
          </g>
        )}

        {state === 'relief' && (
          <g transform="translate(115, 16)">
            <rect x="0" y="0" width="88" height="28" rx="7" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.4" />
            <text x="44" y="18" fill="#047857" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
              Relief (Safe)
            </text>
          </g>
        )}

        {state === 'doubt' && (
          <g transform="translate(75, 12)">
            <rect x="0" y="0" width="125" height="32" rx="8" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="1.4" />
            <text x="62.5" y="20" fill="#BE123C" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
              “Did I really lock it?”
            </text>
            <circle cx="116" cy="37" r="2.5" fill="#F43F5E" />
          </g>
        )}

        {state === 'exposure' && (
          <g transform="translate(90, 16)">
            <rect x="0" y="0" width="104" height="28" rx="7" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.4" />
            <text x="52" y="18" fill="#4338CA" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
              Doubt is here
            </text>
          </g>
        )}

        {state === 'prevention' && (
          <g transform="translate(70, 14)">
            <rect x="0" y="0" width="130" height="30" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.4" />
            <text x="65" y="19" fill="#15803D" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
              Pause & Don't Check
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Clean SVG illustration for Scenario 2:
 * Smartphone message sent on a table.
 */
export function MessageSentScene() {
  return (
    <div className="erp-scene-illustration">
      <svg viewBox="0 0 260 135" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="115" x2="240" y2="115" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        {/* Smartphone */}
        <rect x="80" y="15" width="60" height="98" rx="8" fill="#FFFFFF" stroke="#005387" strokeWidth="2" />
        <rect x="86" y="24" width="48" height="80" rx="4" fill="#F8FAFC" />
        
        {/* Message bubble sent */}
        <rect x="98" y="36" width="32" height="18" rx="4" fill="#0284C7" />
        <line x1="102" y1="42" x2="124" y2="42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="102" y1="48" x2="116" y2="48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

        {/* Thought bubble */}
        <g transform="translate(145, 18)">
          <rect x="0" y="0" width="105" height="40" rx="8" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="1.4" />
          <text x="52.5" y="17" fill="#BE123C" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
            "Did I say
          </text>
          <text x="52.5" y="30" fill="#BE123C" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
            something wrong?"
          </text>
          <circle cx="2" cy="42" r="2.5" fill="#F43F5E" />
        </g>
      </svg>
    </div>
  );
}
