import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  getEmotionContextConfig,
  ACTIVITY_OPTIONS,
  SOCIAL_OPTIONS,
  LOCATION_OPTIONS
} from './emotionContextConfig';

export default function ContextScreen({
  primaryEmotion,
  zone,
  initialContexts = [],
  onConfirm
}) {
  const emotionName = primaryEmotion?.name || 'this';
  const config = useMemo(() => getEmotionContextConfig(primaryEmotion, zone?.id), [primaryEmotion, zone]);

  // Track selection state by dimension
  const [contributingSelected, setContributingSelected] = useState([]);
  const [deeperSelected, setDeeperSelected] = useState([]);
  const [activitiesSelected, setActivitiesSelected] = useState([]);
  const [socialSelected, setSocialSelected] = useState([]);
  const [locationSelected, setLocationSelected] = useState([]);

  // Initialize from initialContexts if passed as an array
  useEffect(() => {
    if (Array.isArray(initialContexts) && initialContexts.length > 0) {
      // Restore matches into appropriate buckets
      setContributingSelected(initialContexts.filter((item) => config.contributingOptions.includes(item)));
      setDeeperSelected(initialContexts.filter((item) => config.deeperOptions.includes(item)));
      setActivitiesSelected(initialContexts.filter((item) => ACTIVITY_OPTIONS.includes(item)));
      setSocialSelected(initialContexts.filter((item) => SOCIAL_OPTIONS.includes(item)));
      setLocationSelected(initialContexts.filter((item) => LOCATION_OPTIONS.includes(item)));
    }
  }, [primaryEmotion?.id, config]);

  // Dynamic emotional accent tokens
  const accentColor = zone?.accent || '#f87171';
  const activeBg = zone?.activeBg || `linear-gradient(135deg, ${accentColor} 0%, #b91c1c 100%)`;
  const glowColor = zone?.glowColor || 'rgba(239, 68, 68, 0.65)';

  // Calming Sky Cyan selection style for selected chips
  const cyanSelectedBg = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
  const cyanSelectedBorder = '1.5px solid rgba(255, 255, 255, 0.55)';
  const cyanSelectedShadow = '0 4px 16px rgba(56, 189, 248, 0.35), 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.35)';

  const toggleItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(8);
      } catch (e) {}
    }
  };

  const handleContinue = () => {
    const allSelectedTags = [
      ...contributingSelected,
      ...deeperSelected,
      ...activitiesSelected,
      ...socialSelected,
      ...locationSelected
    ];

    const structuredContext = {
      emotion_category: config.category,
      contributing_factors: contributingSelected,
      deeper_context: deeperSelected,
      activities: activitiesSelected,
      social_context: socialSelected,
      locations: locationSelected,
      all_tags: allSelectedTags
    };

    onConfirm(allSelectedTags, structuredContext);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        paddingTop: '4px'
      }}
    >
      {/* 1. Emotion-Aware Primary Question Header */}
      <div
        style={{
          textAlign: 'left',
          width: '100%',
          maxWidth: '540px',
          padding: '2px 6px 16px',
          boxSizing: 'border-box'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.75rem, 5.5vw, 2.35rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.18,
            color: '#ffffff',
            margin: 0
          }}
        >
          {config.primaryQuestion(emotionName)}
        </h1>
        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: 'clamp(0.84rem, 2.8vw, 0.92rem)',
            color: '#94a3b8',
            margin: '6px 0 0 0',
            lineHeight: 1.45,
            fontWeight: 500
          }}
        >
          {config.primarySubtitle}
        </p>
      </div>

      {/* 2. Structured Context Dimensions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(20px, 3.8vh, 28px)',
          width: '100%',
          maxWidth: '540px',
          padding: '4px 6px clamp(120px, 18vh, 150px)',
          boxSizing: 'border-box'
        }}
      >
        {/* Dimension 1: Emotion-Specific Contributing Factors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '2px'
            }}
          >
            Contributing Factors
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px clamp(8px, 2vw, 10px)', width: '100%' }}>
            {config.contributingOptions.map((item) => {
              const isSelected = contributingSelected.includes(item);
              return (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item, contributingSelected, setContributingSelected)}
                  whileTap={{ scale: 0.96 }}
                  aria-pressed={isSelected}
                  style={{
                    height: '38px',
                    minHeight: '38px',
                    borderRadius: '12px',
                    padding: '0 15px',
                    background: isSelected ? cyanSelectedBg : 'rgba(255, 255, 255, 0.08)',
                    border: isSelected ? cyanSelectedBorder : '1.5px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: isSelected ? cyanSelectedShadow : '0 1px 3px rgba(0, 0, 0, 0.3)',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    userSelect: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{item}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dimension 2: Emotion-Specific Deeper Context */}
        {config.deeperQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                paddingLeft: '2px'
              }}
            >
              {config.deeperQuestion}
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px clamp(8px, 2vw, 10px)', width: '100%' }}>
              {config.deeperOptions.map((item) => {
                const isSelected = deeperSelected.includes(item);
                return (
                  <motion.button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(item, deeperSelected, setDeeperSelected)}
                    whileTap={{ scale: 0.96 }}
                    aria-pressed={isSelected}
                    style={{
                      height: '38px',
                      minHeight: '38px',
                      borderRadius: '12px',
                      padding: '0 15px',
                      background: isSelected ? cyanSelectedBg : 'rgba(255, 255, 255, 0.08)',
                      border: isSelected ? cyanSelectedBorder : '1.5px solid rgba(255, 255, 255, 0.14)',
                      boxShadow: isSelected ? cyanSelectedShadow : '0 1px 3px rgba(0, 0, 0, 0.3)',
                      color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                      fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                      userSelect: 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{item}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dimension 3: What were you doing? */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '2px'
            }}
          >
            What were you doing?
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px clamp(8px, 2vw, 10px)', width: '100%' }}>
            {ACTIVITY_OPTIONS.map((item) => {
              const isSelected = activitiesSelected.includes(item);
              return (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item, activitiesSelected, setActivitiesSelected)}
                  whileTap={{ scale: 0.96 }}
                  aria-pressed={isSelected}
                  style={{
                    height: '38px',
                    minHeight: '38px',
                    borderRadius: '12px',
                    padding: '0 15px',
                    background: isSelected ? cyanSelectedBg : 'rgba(255, 255, 255, 0.08)',
                    border: isSelected ? cyanSelectedBorder : '1.5px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: isSelected ? cyanSelectedShadow : '0 1px 3px rgba(0, 0, 0, 0.3)',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    userSelect: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{item}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dimension 4: Who were you with? */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '2px'
            }}
          >
            Who were you with?
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px clamp(8px, 2vw, 10px)', width: '100%' }}>
            {SOCIAL_OPTIONS.map((item) => {
              const isSelected = socialSelected.includes(item);
              return (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item, socialSelected, setSocialSelected)}
                  whileTap={{ scale: 0.96 }}
                  aria-pressed={isSelected}
                  style={{
                    height: '38px',
                    minHeight: '38px',
                    borderRadius: '12px',
                    padding: '0 15px',
                    background: isSelected ? cyanSelectedBg : 'rgba(255, 255, 255, 0.08)',
                    border: isSelected ? cyanSelectedBorder : '1.5px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: isSelected ? cyanSelectedShadow : '0 1px 3px rgba(0, 0, 0, 0.3)',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    userSelect: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{item}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dimension 5: Where were you? */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '2px'
            }}
          >
            Where were you?
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px clamp(8px, 2vw, 10px)', width: '100%' }}>
            {LOCATION_OPTIONS.map((item) => {
              const isSelected = locationSelected.includes(item);
              return (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item, locationSelected, setLocationSelected)}
                  whileTap={{ scale: 0.96 }}
                  aria-pressed={isSelected}
                  style={{
                    height: '38px',
                    minHeight: '38px',
                    borderRadius: '12px',
                    padding: '0 15px',
                    background: isSelected ? cyanSelectedBg : 'rgba(255, 255, 255, 0.08)',
                    border: isSelected ? cyanSelectedBorder : '1.5px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: isSelected ? cyanSelectedShadow : '0 1px 3px rgba(0, 0, 0, 0.3)',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    userSelect: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{item}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Sticky Continue Dock */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, rgba(13, 27, 42, 0) 0%, rgba(13, 27, 42, 0.88) 32%, rgba(13, 27, 42, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '14px 16px clamp(16px, 3vh, 24px)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 40,
          boxSizing: 'border-box'
        }}
      >
        <motion.button
          type="button"
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            width: '100%',
            maxWidth: '520px',
            background: activeBg,
            border: 'none',
            borderRadius: '16px',
            padding: '14px 24px',
            color: '#ffffff',
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: '0.98rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 8px 26px -3px ${glowColor}`
          }}
        >
          <span>Continue</span>
          <ArrowRight size={17} strokeWidth={2.4} />
        </motion.button>
      </div>
    </motion.div>
  );
}
