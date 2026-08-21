import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, Activity, LineChart, CheckCircle2 } from 'lucide-react';

const PILLARS = [
  {
    id: 'learn',
    title: 'Learn',
    icon: BookOpen,
    color: '#2563eb',
    bg: '#eff6ff',
    desc: 'Understand something about your thoughts, emotions or wellbeing.'
  },
  {
    id: 'reflect',
    title: 'Reflect',
    icon: Compass,
    color: '#06b6d4',
    bg: '#ecfeff',
    desc: 'Pause and explore what you’re feeling or experiencing.'
  },
  {
    id: 'practice',
    title: 'Practice',
    icon: Activity,
    color: '#3b82f6',
    bg: '#f0f9ff',
    desc: 'Try a practical technique or guided exercise.'
  },
  {
    id: 'track',
    title: 'Track',
    icon: LineChart,
    color: '#10b981',
    bg: '#f0fdf4',
    desc: 'Check in with yourself and notice changes over time.'
  }
];

export default function ActivityPillars() {
  const [selectedPillar, setSelectedPillar] = useState('learn');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 4 Connected Activity Types */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {PILLARS.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPillar === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPillar(p.id)}
              style={{
                background: '#ffffff',
                border: isSelected ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.1)' : '0 1px 3px rgba(15, 23, 42, 0.02)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: p.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: p.color,
                marginBottom: '10px'
              }}>
                <Icon size={18} />
              </div>

              <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {p.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                {p.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Actionable Preview Example */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.88rem',
        color: '#334155',
        fontWeight: 500
      }}>
        <CheckCircle2 size={18} color="#2563eb" />
        <span><strong>Example:</strong> Recognizing patterns in everyday stress</span>
      </div>
    </div>
  );
}
