import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function RhythmPath({
  currentStreak = 0,
  targetMilestone = 7,
  animateNewNode = false,
  totalNodes = 7
}) {
  const shouldReduceMotion = useReducedMotion();

  // Normalize nodes count (default 7 moments per visual path)
  const nodeCount = Math.max(5, Math.min(totalNodes, 10));
  
  // Calculate how many nodes are filled in this current visual cycle
  const filledCount = currentStreak === 0 
    ? 0 
    : ((currentStreak - 1) % nodeCount) + 1;

  const nodes = Array.from({ length: nodeCount }, (_, i) => i + 1);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '320px',
        margin: '0 auto',
        padding: '6px 0',
        position: 'relative'
      }}
    >
      {nodes.map((nodeIndex, i) => {
        const isFilled = nodeIndex <= filledCount;
        const isLatestNew = animateNewNode && nodeIndex === filledCount;
        const isLastNode = i === nodes.length - 1;

        return (
          <React.Fragment key={nodeIndex}>
            {/* Node Circle */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Luminous Aura for Filled Nodes */}
              {isFilled && (
                <motion.div
                  initial={isLatestNew && !shouldReduceMotion ? { scale: 0, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(45, 212, 191, 0.15) 50%, transparent 80%)',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Core Tactile Point */}
              <motion.div
                initial={isLatestNew && !shouldReduceMotion ? { scale: 0.4, opacity: 0 } : false}
                animate={{ scale: isFilled ? 1 : 0.88, opacity: isFilled ? 1 : 0.35 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  width: isFilled ? '9px' : '7px',
                  height: isFilled ? '9px' : '7px',
                  borderRadius: '50%',
                  background: isFilled
                    ? 'linear-gradient(135deg, #ffffff 0%, #38bdf8 60%, #0284c7 100%)'
                    : 'rgba(255, 255, 255, 0.25)',
                  border: isFilled ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isFilled ? '0 0 10px rgba(56, 189, 248, 0.7)' : 'none',
                  zIndex: 2,
                  flexShrink: 0
                }}
              />
            </div>

            {/* Connecting Thread Between Nodes */}
            {!isLastNode && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  position: 'relative',
                  margin: '0 4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '1px',
                  overflow: 'hidden'
                }}
              >
                {nodeIndex < filledCount && (
                  <motion.div
                    initial={isLatestNew && !shouldReduceMotion ? { scaleX: 0 } : false}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, #38bdf8 0%, #2dd4bf 100%)',
                      boxShadow: '0 0 6px rgba(56, 189, 248, 0.5)',
                      transformOrigin: 'left'
                    }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
