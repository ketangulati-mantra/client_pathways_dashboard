import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Activity, Compass, TrendingUp, ArrowRight } from 'lucide-react';

const PROGRESSION_STEPS = [
  {
    step: '01',
    title: 'Understand',
    desc: 'Identify what triggers your stress or mood changes.',
    icon: BookOpen,
    color: '#2563eb',
    bg: '#eff6ff'
  },
  {
    step: '02',
    title: 'Practice',
    desc: 'Apply short, guided techniques in the moment.',
    icon: Activity,
    color: '#06b6d4',
    bg: '#ecfeff'
  },
  {
    step: '03',
    title: 'Reflect',
    desc: 'Check in on what worked and how you feel.',
    icon: Compass,
    color: '#3b82f6',
    bg: '#f0f9ff'
  },
  {
    step: '04',
    title: 'Progress',
    desc: 'Notice gradual improvements over time.',
    icon: TrendingUp,
    color: '#10b981',
    bg: '#f0fdf4'
  }
];

export default function JourneyMilestones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4-Step Conceptual Progression */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {PROGRESSION_STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px 18px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: s.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color
                }}>
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8' }}>
                  {s.step}
                </span>
              </div>

              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {s.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.45 }}>
                  {s.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 18px',
        fontSize: '0.9rem',
        color: '#475569',
        fontWeight: 500
      }}>
        Your personalized plan can include a structured 60-day journey with guided activities along the way.
      </div>
    </div>
  );
}
