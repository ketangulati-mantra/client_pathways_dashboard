import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  Smile,
  Zap,
  Sparkles,
  Compass,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { submitAssessmentResults } from '../../mantra/api';
import { buildAssessmentWebhookPayload } from '../../utils/assessmentEngine';
import { handleExit } from '../../mantra/navigation';

const CATEGORY_META = {
  anxiety: {
    icon: Zap,
    label: 'Anxiety',
    color: '#0284c7',
    bg: '#f0f9ff'
  },
  depression: {
    icon: Smile,
    label: 'Depression',
    color: '#4f46e5',
    bg: '#eef2ff'
  },
  stress: {
    icon: Heart,
    label: 'Stress',
    color: '#0d9488',
    bg: '#f0fdfa'
  }
};

/**
 * Generates ultra-concise, high-value personalized insights.
 */
function analyzeAssessmentResponses(report) {
  const results = report?.results || [];
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const highest = sorted[0] || { categoryId: 'stress', categoryName: 'Stress', score: 3 };

  const isAllMild = results.every(
    (r) => (r.severityLabel || '').toLowerCase().includes('mild') || r.score <= 5
  );
  const isSevere = results.some((r) => {
    const l = (r.severityLabel || '').toLowerCase();
    return l.includes('severe') || r.score >= 9;
  });
  const isModerate =
    !isSevere &&
    results.some(
      (r) => (r.severityLabel || '').toLowerCase().includes('moderate') || r.score >= 6
    );

  // 1. One crisp summary sentence
  let whatThisMeans = '';
  if (isAllMild) {
    whatThisMeans =
      'Your responses show a steady, low-stress baseline. You have a solid foundation to maintain healthy daily habits.';
  } else if (highest.categoryId === 'anxiety') {
    whatThisMeans =
      'Anxiety and nervous tension appear to be taking the most energy right now. Starting with simple grounding exercises can help you feel more centered.';
  } else if (highest.categoryId === 'stress') {
    whatThisMeans =
      'Stress and daily tension seem most elevated right now. Taking brief, intentional pauses between tasks can help your body reset.';
  } else {
    whatThisMeans =
      'Low mood and lower motivation seem most prominent right now. Committing to one small, enjoyable routine each day is the best place to start.';
  }

  // 2. Exactly TWO concise actionable recommendations
  let twoActions = [];
  if (highest.categoryId === 'anxiety' && !isAllMild) {
    twoActions = [
      {
        num: '01',
        title: 'Ground your body',
        desc: 'Slow your breathing and notice your immediate physical surroundings when tension rises.'
      },
      {
        num: '02',
        title: 'Wind-down buffer',
        desc: 'Give yourself 5–10 screen-free quiet minutes before bed or after stressful moments.'
      }
    ];
  } else if (highest.categoryId === 'stress' && !isAllMild) {
    twoActions = [
      {
        num: '01',
        title: 'Take 5-minute pauses',
        desc: 'Step away between demanding activities to let your breathing and muscle tension settle.'
      },
      {
        num: '02',
        title: 'Protect your evenings',
        desc: 'Keep a clear boundary between daytime tasks and your personal rest time.'
      }
    ];
  } else if (highest.categoryId === 'depression' && !isAllMild) {
    twoActions = [
      {
        num: '01',
        title: 'Keep one small routine',
        desc: 'Pick one simple action you can complete reliably, even on low-energy days.'
      },
      {
        num: '02',
        title: 'Stay connected',
        desc: 'A quick text or check-in with someone supportive helps prevent emotional withdrawal.'
      }
    ];
  } else {
    twoActions = [
      {
        num: '01',
        title: 'Maintain your anchors',
        desc: 'Consistent sleep, movement, and quiet reflection preserve your steady state.'
      },
      {
        num: '02',
        title: 'Check in weekly',
        desc: 'Brief weekly reflections help you catch tension before it accumulates.'
      }
    ];
  }

  // 3. Exactly TWO relevant Mantra tools
  let twoTools = [];
  if (highest.categoryId === 'anxiety') {
    twoTools = [
      {
        icon: Compass,
        title: 'Calming Tools',
        desc: 'Quick grounding & breathing exercises',
        color: '#0284c7',
        bg: '#f0f9ff'
      },
      {
        icon: Sparkles,
        title: 'Mindfulness',
        desc: 'Short practices for mental ease',
        color: '#6366f1',
        bg: '#eef2ff'
      }
    ];
  } else if (highest.categoryId === 'stress') {
    twoTools = [
      {
        icon: Sparkles,
        title: 'Mindfulness',
        desc: 'Quick resets to downshift stress',
        color: '#0d9488',
        bg: '#f0fdfa'
      },
      {
        icon: BookOpen,
        title: 'Guided Journaling',
        desc: 'Prompts to reflect on stress patterns',
        color: '#0284c7',
        bg: '#f0f9ff'
      }
    ];
  } else if (highest.categoryId === 'depression') {
    twoTools = [
      {
        icon: Compass,
        title: 'Guided Activities',
        desc: 'Micro-habits to rebuild momentum',
        color: '#4f46e5',
        bg: '#eef2ff'
      },
      {
        icon: BookOpen,
        title: 'Guided Journaling',
        desc: 'Gentle check-in prompts',
        color: '#0d9488',
        bg: '#f0fdfa'
      }
    ];
  } else {
    twoTools = [
      {
        icon: Sparkles,
        title: 'Daily Meditations',
        desc: 'Mindful practices for clarity',
        color: '#0d9488',
        bg: '#f0fdfa'
      },
      {
        icon: Compass,
        title: 'Habit Pathways',
        desc: 'Practical micro-lessons',
        color: '#0284c7',
        bg: '#f0f9ff'
      }
    ];
  }

  // 4. One short interpretation per category row
  const categoryInterpretations = {};
  for (const r of results) {
    const cat = r.categoryId.toLowerCase();
    const sc = r.score;

    if (cat === 'anxiety') {
      categoryInterpretations[cat] = sc >= 9
        ? 'Anxiety and physical tension are currently taking up significant space.'
        : sc >= 6
        ? 'Occasional worry or physical tension noted over the past week.'
        : 'Minimal signs of nervousness or physical tension.';
    } else if (cat === 'depression') {
      categoryInterpretations[cat] = sc >= 9
        ? 'Noticeable low energy and emotional heaviness present right now.'
        : sc >= 6
        ? 'Some moments of lower motivation and energy noted.'
        : 'Positive affect with minimal signs of low mood.';
    } else {
      categoryInterpretations[cat] = sc >= 9
        ? 'Daily stress and difficulty unwinding are currently prominent.'
        : sc >= 6
        ? 'Moderate tension and a busy nervous system noted.'
        : 'Everyday demands managed with good balance.';
    }
  }

  return {
    isAllMild,
    isModerate,
    isSevere,
    whatThisMeans,
    twoActions,
    twoTools,
    categoryInterpretations
  };
}

function getBadgeStyle(label = '') {
  const l = label.toLowerCase();
  if (l.includes('normal') || l.includes('low') || l.includes('mild')) {
    return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
  }
  if (l.includes('moderate')) {
    return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
  }
  return { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' };
}

function SeverityBarRow({ result, interpretation, isLast = false, index = 0 }) {
  const meta = CATEGORY_META[result.categoryId.toLowerCase()] || {
    icon: Heart,
    label: result.categoryName,
    color: '#2563eb',
    bg: '#eff6ff'
  };
  const Icon = meta.icon;
  const badge = getBadgeStyle(result.severityLabel);

  const minScore = result.minPossibleScore || 3;
  const maxScore = result.maxPossibleScore || 12;
  const scoreSpan = Math.max(1, maxScore - minScore);
  const markerPercentage = Math.min(94, Math.max(6, ((result.score - minScore) / scoreSpan) * 100));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '14px 0',
        borderBottom: isLast ? 'none' : '1px solid #f1f5f9'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: meta.bg,
              color: meta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={15} strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
            {result.categoryName}
          </span>
        </div>

        <span
          style={{
            padding: '2px 9px',
            borderRadius: '9999px',
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            fontSize: '0.74rem',
            fontWeight: 700
          }}
        >
          {result.severityLabel}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '6px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 38%, #fbbf24 72%, #f43f5e 100%)',
            margin: '4px 0 2px'
          }}
        >
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: `${markerPercentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 + index * 0.06 }}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '2.5px solid #0f172a',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontWeight: 600
          }}
        >
          <span>Mild</span>
          <span>Moderate</span>
          <span>Higher</span>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '0.82rem',
          color: '#475569',
          lineHeight: 1.4
        }}
      >
        {interpretation}
      </p>
    </div>
  );
}

export function AssessmentReport({ report, onComplete }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  const insights = analyzeAssessmentResponses(report);

  const handleMarkAsDone = async () => {
    if (isCompleted || isCompleting) return;

    setIsCompleting(true);
    setCompleteError(null);

    const payload = buildAssessmentWebhookPayload(report.results, {
      activityId: 'emotional-wellbeing-assessment'
    });

    try {
      const res = await submitAssessmentResults(payload);

      if (!res.success) {
        setCompleteError(
          res.error || "We couldn't save your activity completion right now. Your assessment results are safe."
        );
        setIsCompleting(false);
        return;
      }

      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setCompleteError("We couldn't save your activity completion right now. Your assessment results are safe.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '860px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: 'clamp(16px, 3vw, 32px) 0 48px',
        boxSizing: 'border-box'
      }}
    >
      {/* =================================================================
          1. HEADER INTRODUCTION
         ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: '#eff6ff',
            color: '#2563eb',
            fontSize: '0.74rem',
            fontWeight: 700,
            width: 'fit-content'
          }}
        >
          <ShieldCheck size={12} />
          <span>Wellbeing Check-In</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.3rem, 2.8vw, 1.65rem)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.25
          }}
        >
          Here's what your wellbeing check-in shows.
        </h1>

        <p
          style={{
            fontSize: '0.82rem',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.4
          }}
        >
          This is a starting point for understanding how you've been feeling - not a diagnosis.
        </p>
      </motion.div>

      {/* =================================================================
          2. YOUR WELLBEING SNAPSHOT (Hero Card)
         ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.04 }}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          padding: '18px 20px 10px',
          boxShadow: '0 3px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#2563eb',
            marginBottom: '2px'
          }}
        >
          Your Wellbeing Snapshot
        </span>

        {report.results.map((result, idx) => (
          <SeverityBarRow
            key={result.categoryId}
            result={result}
            interpretation={insights.categoryInterpretations[result.categoryId.toLowerCase()]}
            index={idx}
            isLast={idx === report.results.length - 1}
          />
        ))}
      </motion.div>

      {/* =================================================================
          3. UNIFIED INSIGHTS & ACTIONS GUIDE (Distinct Soft Container)
         ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        style={{
          background: '#f8fafc',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Sub-section A: What this means */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0f172a'
            }}
          >
            What this means
          </span>
          <p
            style={{
              margin: 0,
              fontSize: '0.86rem',
              color: '#334155',
              lineHeight: 1.5
            }}
          >
            {insights.whatThisMeans}
          </p>
        </div>

        <div style={{ width: '100%', height: '1px', background: '#e2e8f0' }} />

        {/* Sub-section B: What to try first */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b'
            }}
          >
            What to try first
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px'
            }}
          >
            {insights.twoActions.map((action) => (
              <div
                key={action.num}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#2563eb' }}>
                    {action.num}
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                    {action.title}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.78rem',
                    color: '#64748b',
                    lineHeight: 1.4
                  }}
                >
                  {action.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', background: '#e2e8f0' }} />

        {/* Sub-section C: You can also try (Mantra Tools) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b'
            }}
          >
            You can also try
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px'
            }}
          >
            {insights.twoTools.map((tool, idx) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)'
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '7px',
                      background: tool.bg,
                      color: tool.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <ToolIcon size={14} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      {tool.title}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {tool.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* =================================================================
          4. PROFESSIONAL SUPPORT (Conditional Gradient Accent)
         ================================================================= */}
      {insights.isSevere ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
            borderRadius: '16px',
            border: '1.5px solid #bae6fd',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '420px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Professional Support
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0369a1' }}>
              You don't have to work through this alone.
            </span>
            <span style={{ fontSize: '0.78rem', color: '#334155' }}>
              Talking with a professional can give you personalized guidance.
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.open('https://web.mantracare.com/plans/all', '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '9px 18px',
              borderRadius: '9999px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Explore Therapy Options</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : insights.isModerate ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              Want someone to talk to?
            </span>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Professional support is available whenever you need it.
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.open('https://web.mantracare.com/plans/all', '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Explore Support</span>
            <ArrowRight size={12} />
          </button>
        </div>
      ) : null}

      {/* =================================================================
          5. COMPLETION BLOCK (Dedicated Action Area)
         ================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #e2e8f0',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '10px',
          boxShadow: '0 3px 10px rgba(15, 23, 42, 0.03)'
        }}
      >
        {completeError && (
          <div
            style={{
              width: '100%',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.78rem',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span>{completeError}</span>
            <button
              type="button"
              onClick={handleMarkAsDone}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: 'none',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!isCompleted ? (
          <>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Ready to keep going?
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Complete your check-in to save your progress and continue.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAsDone}
              disabled={isCompleting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 28px',
                borderRadius: '9999px',
                border: 'none',
                background: isCompleting ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: isCompleting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (!isCompleting) {
                  e.currentTarget.style.background = '#1d4ed8';
                }
              }}
              onMouseOut={(e) => {
                if (!isCompleting) {
                  e.currentTarget.style.background = '#2563eb';
                }
              }}
            >
              {isCompleting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving Completion...</span>
                </>
              ) : (
                <>
                  <span>Mark Activity as Done</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              width: '100%'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                fontSize: '0.82rem',
                fontWeight: 800
              }}
            >
              <CheckCircle2 size={14} />
              <span>Activity Completed</span>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
              Your check-in has been saved.
            </p>

            <button
              type="button"
              onClick={() => handleExit()}
              style={{
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 22px',
                borderRadius: '9999px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(15, 23, 42, 0.12)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Continue to My Plan</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
