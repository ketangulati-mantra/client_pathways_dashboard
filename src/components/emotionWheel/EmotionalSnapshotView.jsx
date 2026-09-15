import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Share2,
  ArrowRight,
  Shield,
  Ear,
  Zap,
  Pause,
  Feather,
  Compass,
  HeartHandshake,
  Heart,
  Eye,
  Anchor,
  Sparkles
} from 'lucide-react';
import { evaluateEmotionWheelNextStep, EMOTION_SUPPORT_TIERS } from '../../utils/emotionWheelRouter';
import ShareableEmotionalSnapshotModal from './ShareableEmotionalSnapshotModal';
import { trackEmotionWheelEvent } from '../../utils/emotionAnalytics';

// Helper to map long context phrases into short, scannable concept pills with clean icons
function getConceptBadge(text) {
  const lower = (text || '').toLowerCase();

  if (lower.includes('boundary') || lower.includes('corner') || lower.includes('limit')) {
    return { label: 'Boundary', icon: Shield };
  }
  if (lower.includes('disrespect') || lower.includes('attack') || lower.includes('unfair')) {
    return { label: 'Fairness & Respect', icon: Zap };
  }
  if (lower.includes('unheard') || lower.includes('believed') || lower.includes('voice')) {
    return { label: 'Being Heard', icon: Ear };
  }
  if (lower.includes('control') || lower.includes('pushed')) {
    return { label: 'Feeling Pushed', icon: Anchor };
  }
  if (lower.includes('loss') || lower.includes('miss') || lower.includes('grief')) {
    return { label: 'Honoring Loss', icon: Heart };
  }
  if (lower.includes('alone') || lower.includes('unseen') || lower.includes('left out')) {
    return { label: 'Connection', icon: Eye };
  }
  if (lower.includes('uncertainty') || lower.includes('unknown') || lower.includes('overload')) {
    return { label: 'Uncertainty', icon: Compass };
  }
  if (lower.includes('went well') || lower.includes('hope') || lower.includes('gratitude')) {
    return { label: 'Appreciation', icon: Sparkles };
  }

  // Fallback: take first 3-4 words
  const words = text.split(' ').slice(0, 3).join(' ');
  return { label: words, icon: Sparkles };
}

// Helper to map long need phrases into short, scannable action concepts with clean icons
function getNeedBadge(text) {
  const lower = (text || '').toLowerCase();

  if (lower.includes('pause') || lower.includes('slow') || lower.includes('distance')) {
    return { label: 'Pause before responding', icon: Pause };
  }
  if (lower.includes('let this out') || lower.includes('express') || lower.includes('cry')) {
    return { label: 'Safe expression', icon: Feather };
  }
  if (lower.includes('heard') || lower.includes('talk') || lower.includes('connection')) {
    return { label: 'Feeling heard', icon: Ear };
  }
  if (lower.includes('boundary')) {
    return { label: 'Clear boundary', icon: Shield };
  }
  if (lower.includes('understand') || lower.includes('clarity') || lower.includes('digest')) {
    return { label: 'Understanding the root', icon: Compass };
  }
  if (lower.includes('ground') || lower.includes('breathe') || lower.includes('rest')) {
    return { label: 'Grounding & rest', icon: Anchor };
  }
  if (lower.includes('savor') || lower.includes('hold') || lower.includes('compassion')) {
    return { label: 'Self-compassion', icon: Heart };
  }

  const words = text.split(' ').slice(0, 3).join(' ');
  return { label: words, icon: Sparkles };
}

export default function EmotionalSnapshotView({
  emotion,
  family,
  intensity = 3,
  selectedContexts = [],
  freeText = '',
  selectedNeeds = [],
  config,
  onReset,
  onFinish,
  onNavigate
}) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const themeColor = family?.color || '#38bdf8';
  const parentFamilyName = family?.name || 'Feeling';
  const emotionName = emotion?.name || 'This feeling';

  const nextStepPlan = useMemo(() => {
    return evaluateEmotionWheelNextStep({
      emotion,
      family,
      intensity,
      selectedContexts,
      selectedNeeds,
      freeText
    });
  }, [emotion, family, intensity, selectedContexts, selectedNeeds, freeText]);

  useEffect(() => {
    trackEmotionWheelEvent('emotion_snapshot_viewed', {
      familyId: family?.id,
      emotionId: emotion?.id,
      intensity,
      tier: nextStepPlan.tier
    });
  }, [family, emotion, intensity, nextStepPlan]);

  // Concise, personalized one-line synthesis (< 20 words)
  const oneLineInsight = useMemo(() => {
    const famId = (family?.id || '').toLowerCase();
    const eId = (emotion?.id || '').toLowerCase();

    if (famId === 'anger' || eId === 'provoked') {
      return 'Something important may have felt crossed. Taking space before responding can protect your peace.';
    }
    if (famId === 'sadness') {
      return 'You are honoring something that mattered. Giving yourself gentle space is enough for today.';
    }
    if (famId === 'fear') {
      return 'Your nervous system is asking for reassurance and steadiness right now.';
    }
    if (famId === 'love') {
      return 'Warmth and care are present. Let yourself receive and treasure this connection.';
    }
    if (famId === 'joy') {
      return 'A moment of brightness has arrived. Take a quiet breath to fully savor it.';
    }
    if (famId === 'surprise') {
      return 'Things shifted unexpectedly. Give your mind a moment to catch up without rushing.';
    }

    return 'Acknowledging this feeling gives you room to understand what you need most right now.';
  }, [family, emotion]);

  const handleActionClick = (route, actionType) => {
    trackEmotionWheelEvent('emotion_recommendation_clicked', {
      route,
      actionType,
      tier: nextStepPlan.tier
    });

    if (onNavigate && route) {
      onNavigate(route);
    } else if (onFinish) {
      onFinish();
    }
  };

  // Convert selected contexts into distinct visual concepts
  const contextBadges = useMemo(() => {
    return selectedContexts.slice(0, 4).map(getConceptBadge);
  }, [selectedContexts]);

  // Convert selected needs into distinct visual concepts
  const needBadges = useMemo(() => {
    return selectedNeeds.slice(0, 3).map(getNeedBadge);
  }, [selectedNeeds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto',
        padding: '8px 12px 40px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. COMPOSITION HEADER */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.45)',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: '8px'
        }}
      >
        Your Emotional Snapshot
      </span>

      {/* 2. EMOTION HERO */}
      <motion.h1
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        style={{
          fontSize: 'clamp(38px, 9vw, 54px)',
          fontWeight: '900',
          color: themeColor,
          letterSpacing: '-0.02em',
          margin: '0 0 6px 0',
          lineHeight: 1.05,
          textAlign: 'center',
          textShadow: `0 0 32px ${themeColor}50`
        }}
      >
        {emotionName}
      </motion.h1>

      {/* 3. PARENT & INTENSITY RATING */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {parentFamilyName}
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>·</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
          {intensity}/5
        </span>
      </div>

      {/* 4. VISUAL INTENSITY DOTS (● ● ● ○ ○) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}
      >
        {[1, 2, 3, 4, 5].map((dot) => {
          const isActive = dot <= intensity;
          return (
            <div
              key={dot}
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: isActive ? themeColor : 'rgba(255, 255, 255, 0.15)',
                boxShadow: isActive ? `0 0 10px ${themeColor}90` : 'none',
                transition: 'all 0.3s ease'
              }}
            />
          );
        })}
      </div>

      {/* 5. CONCISE ONE-LINE INSIGHT (<20 words, no verbose AI paragraph) */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4 }}
        style={{
          margin: '0 0 32px 0',
          fontSize: '16.5px',
          color: 'rgba(255, 255, 255, 0.95)',
          lineHeight: 1.5,
          textAlign: 'center',
          maxWidth: '420px',
          fontWeight: '450'
        }}
      >
        "{oneLineInsight}"
      </motion.p>

      {/* 6. WHAT SEEMED TO MATTER (Clean icons + short concept pills) */}
      {contextBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '26px'
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.45)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '10px'
            }}
          >
            What Seemed Connected
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            {contextBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '500'
                  }}
                >
                  <Icon size={14} color={themeColor} />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 7. WHAT MIGHT HELP (Clean icons + short action concepts) */}
      {needBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.26, duration: 0.4 }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '32px'
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: '700',
              color: themeColor,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '10px'
            }}
          >
            What Might Help Right Now
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            {needBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    background: `${themeColor}15`,
                    border: `1px solid ${themeColor}35`,
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '600'
                  }}
                >
                  <Icon size={14} color={themeColor} />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 8. A THOUGHT TO CARRY (Generous whitespace, unboxed) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.32, duration: 0.4 }}
        style={{
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
          marginBottom: '28px',
          width: '100%'
        }}
      >
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            display: 'block',
            marginBottom: '6px'
          }}
        >
          A Thought to Carry
        </span>
        <p
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.88)',
            fontStyle: 'italic',
            lineHeight: 1.45
          }}
        >
          "{nextStepPlan.takeawayThought || config?.takeawayThought || 'You do not have to solve everything right now. Just this present breath.'}"
        </p>
      </motion.div>

      {/* 9. VIRAL SHAREABLE SNAPSHOT TRIGGER (Clean, Sleek, Radiant Button) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.36, duration: 0.4 }}
        style={{ marginBottom: '28px', width: 'auto', display: 'flex', justifyContent: 'center' }}
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsShareModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 60%, #4f46e5 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '9999px',
            padding: '10px 20px',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px -2px rgba(37, 99, 235, 0.45)',
            letterSpacing: '0.01em',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={15} color="#ffffff" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.7))' }} />
          <span>Share Emotional Snapshot</span>
        </motion.button>
      </motion.div>

      {/* 10. COMPASSIONATE SUPPORT TRANSITION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{
          width: '100%',
          textAlign: 'center',
          marginBottom: '24px'
        }}
      >
        {nextStepPlan.tier === EMOTION_SUPPORT_TIERS.STRONGER_SUPPORT ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <HeartHandshake size={17} color="#f87171" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#f87171' }}>
                You don’t have to work through this alone
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45, margin: '0 0 16px 0' }}>
              Talking with someone can give you space to understand what is underneath.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(nextStepPlan.primaryAction.route, nextStepPlan.primaryAction.type)}
              style={{
                width: '100%',
                maxWidth: '340px',
                background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{nextStepPlan.primaryAction.cta || nextStepPlan.primaryAction.ctaLabel?.replace(' →', '') || 'Explore therapy support'}</span>
              <ArrowRight size={17} />
            </motion.button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <Compass size={16} color={themeColor} />
              <span style={{ fontSize: '13px', color: themeColor, fontWeight: '700' }}>
                {nextStepPlan.primaryAction.title}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45, margin: '0 0 16px 0' }}>
              {nextStepPlan.primaryAction.subtitle}
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(nextStepPlan.primaryAction.route, nextStepPlan.primaryAction.type)}
              style={{
                width: '100%',
                maxWidth: '340px',
                background: `linear-gradient(135deg, ${themeColor} 0%, #2563eb 100%)`,
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: `0 8px 24px ${themeColor}35`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{nextStepPlan.primaryAction.cta || nextStepPlan.primaryAction.ctaLabel?.replace(' →', '') || 'Continue'}</span>
              <ArrowRight size={17} />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* 11. RE-EXPLORE LINK */}
      <button
        onClick={onReset}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.45)',
          fontSize: '13.5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <RotateCcw size={13} />
        <span>Explore another feeling</span>
      </button>

      {/* SHAREABLE SINGLE SNAPSHOT MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <ShareableEmotionalSnapshotModal
            emotion={emotion}
            family={family}
            intensity={intensity}
            selectedContexts={selectedContexts}
            selectedNeeds={selectedNeeds}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
