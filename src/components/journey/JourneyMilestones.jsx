import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

const CONDITIONS = [
  { id: 'anxiety', label: 'Anxiety & Panic', focus: 'Calming physical triggers & cognitive reframing' },
  { id: 'depression', label: 'Low Mood & Depression', focus: 'Behavioral activation & gentle daily routine building' },
  { id: 'stress', label: 'Chronic Stress & Burnout', focus: 'Somatic regulation & nervous system recovery' },
  { id: 'adhd', label: 'ADHD & Focus', focus: 'Executive function systems & overwhelm reduction' },
  { id: 'ocd', label: 'OCD & Intrusive Thoughts', focus: 'Exposure response & cognitive flexibility' }
];

const MILESTONES = [
  { day: 'Day 01–07', title: 'Foundation & Awareness', desc: 'Identify baseline triggers, understand symptoms, and establish grounding practices.' },
  { day: 'Day 08–21', title: 'Pattern Recognition', desc: 'Notice cognitive distortions, log daily mood shifts, and introduce core micro-habits.' },
  { day: 'Day 22–35', title: 'Active Skill Building', desc: 'Apply evidence-based CBT/DBT techniques during elevated stress moments.' },
  { day: 'Day 36–48', title: 'Deepening Resilience', desc: 'Integrate mindfulness, somatic body scans, and personalized challenge drills.' },
  { day: 'Day 49–60', title: 'Long-Term Maintenance', desc: 'Consolidate progress, prevent relapse, and build a lasting self-care blueprint.' }
];

export default function JourneyMilestones() {
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Condition Selector Chips */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
          Select a focus area to preview plan:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CONDITIONS.map((c) => {
            const isSelected = selectedCondition.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCondition(c)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none'
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan Details Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCondition.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Personalized Focus
            </div>
            <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>
              {selectedCondition.focus}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 5-Milestone Roadmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
        {/* Connecting line */}
        <div style={{
          position: 'absolute',
          left: '23px',
          top: '24px',
          bottom: '24px',
          width: '2px',
          background: 'linear-gradient(to bottom, #2563eb, #60a5fa, #93c5fd)',
          zIndex: 0
        }} />

        {MILESTONES.map((m, idx) => (
          <motion.div
            key={m.day}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '18px',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Number Indicator */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: idx === 0 ? '#2563eb' : '#ffffff',
              color: idx === 0 ? '#ffffff' : '#2563eb',
              border: '2px solid #2563eb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)'
            }}>
              <span>0{idx + 1}</span>
            </div>

            {/* Content Card */}
            <div style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px 22px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 10px', borderRadius: '9999px' }}>
                  {m.day}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  Guided Activities + Checkpoints
                </span>
              </div>
              <h4 style={{ margin: '6px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                {m.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.55 }}>
                {m.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
