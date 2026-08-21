import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowRight, CheckCircle2, Gift, HeartHandshake, UserCheck, Stethoscope } from 'lucide-react';

const REWARD_OPTIONS = [
  { id: 'therapy', title: '1-on-1 Clinical Therapy', icon: HeartHandshake, color: '#2563eb', bg: '#eff6ff', value: 'Redeem toward sessions' },
  { id: 'doctor', title: 'Doctor & Psychiatric Consult', icon: Stethoscope, color: '#0284c7', bg: '#f0f9ff', value: 'Medication management' },
  { id: 'coaching', title: 'Wellness & Stress Coaching', icon: UserCheck, color: '#06b6d4', bg: '#ecfeff', value: 'Habit accountability' },
  { id: 'yoga', title: 'Live Yoga & Somatic Passes', icon: Gift, color: '#10b981', bg: '#f0fdf4', value: 'Group & private flows' }
];

export default function PointsVisualizer() {
  const [tokenStep, setTokenStep] = useState(0);

  const triggerTokenFlow = () => {
    setTokenStep(1);
    setTimeout(() => setTokenStep(2), 700);
    setTimeout(() => setTokenStep(3), 1500);
    setTimeout(() => setTokenStep(0), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Physical / Spatial Progression Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '28px 32px',
        boxShadow: '0 8px 28px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Step Progression Diagram */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Step 1 */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Step 1
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Complete Activity
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={20} color="#94a3b8" />
          </div>

          {/* Step 2 with animated token */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '6px' }}>
              Step 2
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1rem', fontWeight: 800, color: '#1d4ed8' }}>
              <Award size={18} />
              <span>+10 Points</span>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={20} color="#94a3b8" />
          </div>

          {/* Step 3 */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Step 3
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Redeem Rewards
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>
          Points reflect your ongoing commitment to health. Depending on eligible employer benefits or individual subscriptions, your accumulated points can be applied toward:
        </p>

        {/* Reward Redemption Eligible Services */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px'
        }}>
          {REWARD_OPTIONS.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: r.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: r.color,
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <h6 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                    {r.title}
                  </h6>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {r.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
