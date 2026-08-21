import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, Activity, LineChart, CheckCircle2, ArrowRight } from 'lucide-react';

const PILLARS = [
  {
    id: 'learn',
    title: 'Learn',
    subtitle: 'Evidence-based insights',
    icon: BookOpen,
    color: '#2563eb',
    bg: '#eff6ff',
    desc: 'Understand something about your thoughts, emotions or wellbeing through bite-sized, clinical psychoeducation.',
    example: 'Example: “Recognizing cognitive distortions in everyday stress”'
  },
  {
    id: 'reflect',
    title: 'Reflect',
    subtitle: 'Guided self-inquiry',
    icon: Compass,
    color: '#06b6d4',
    bg: '#ecfeff',
    desc: 'Pause and explore what you’re feeling or experiencing with prompts designed to build self-awareness.',
    example: 'Example: “Exploring the root of current tension”'
  },
  {
    id: 'practice',
    title: 'Practice',
    subtitle: 'Active clinical exercises',
    icon: Activity,
    color: '#3b82f6',
    bg: '#f0fdf4',
    desc: 'Try a practical technique or guided exercise like progressive muscle relaxation, 4-7-8 breathing, or CBT thought records.',
    example: 'Example: “5-minute box breathing somatic reset”'
  },
  {
    id: 'track',
    title: 'Track',
    subtitle: 'Sustained momentum',
    icon: LineChart,
    color: '#10b981',
    bg: '#f0fdf4',
    desc: 'Check in with yourself and notice positive changes over time with clinical assessments and mood charts.',
    example: 'Example: “Weekly PHQ-9 / GAD-7 symptom baseline check”'
  }
];

export default function ActivityPillars() {
  const [activeTab, setActiveTab] = useState('learn');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 4 Interactive Connected Node Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {PILLARS.map((p, idx) => {
          const Icon = p.icon;
          const isActive = activeTab === p.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: '#ffffff',
                border: isActive ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive
                  ? `0 12px 24px -4px rgba(37, 99, 235, 0.12), 0 0 0 1px ${p.color}`
                  : '0 2px 6px rgba(15, 23, 42, 0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Active subtle background accent */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: p.color
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: p.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: p.color
                }}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>
                  0{idx + 1}
                </span>
              </div>

              <h4 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {p.title}
              </h4>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                {p.subtitle}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic Detail Card for Active Pillar */}
      {(() => {
        const current = PILLARS.find(p => p.id === activeTab) || PILLARS[0];
        const Icon = current.icon;
        return (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '28px 32px',
              boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: current.bg, color: current.color }}>
                <Icon size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                How {current.title} Moves You Forward
              </h4>
            </div>

            <p style={{ margin: 0, fontSize: '0.98rem', color: '#334155', lineHeight: 1.65 }}>
              {current.desc}
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              color: '#475569',
              fontWeight: 500
            }}>
              <CheckCircle2 size={16} color={current.color} />
              <span>{current.example}</span>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
