import React from 'react';
import { Award, ArrowRight, ExternalLink } from 'lucide-react';

export default function PointsVisualizer() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      padding: '24px 22px',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* 4-Step Flow Sequence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Step 1 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Step 1</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Do something helpful</div>
        </div>

        {/* Step 2 */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Step 2</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1d4ed8', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Award size={14} />
            <span>Earn points (+10)</span>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Step 3</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Build progress</div>
        </div>

        {/* Step 4 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Step 4</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Use eligible rewards</div>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.55 }}>
        Depending on the rewards available to you, eligible points can be used toward wellness services available through Mantra—including therapy, coaching, fitness, yoga and other wellness services.
      </p>

      {/* Secondary Exact Link */}
      <div>
        <a
          href="https://web.mantracare.com/plans/all"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#2563eb',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
        >
          <span>View plans & available services</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
