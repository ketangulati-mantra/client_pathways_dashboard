const fs = require('fs');

const reportContent = `import React from 'react';
import { ArrowRight, Cloud, HeartPulse, BrainCircuit, Activity } from 'lucide-react';

const CATEGORY_ICONS = {
  depression: Cloud,
  anxiety: HeartPulse,
  stress: BrainCircuit
};

export function CategoryMeter({ result }) {
  const percentage = (result.score / result.maxPossibleScore) * 100;
  const Icon = CATEGORY_ICONS[result.categoryId.toLowerCase()] || Activity;

  return (
    <div className="animate-slide-up" style={{ 
      background: '#ffffff', 
      padding: '24px', 
      borderRadius: '24px', 
      border: '1px solid #e2e8f0', 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03)', 
      marginBottom: '24px' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: result.color + '15', borderRadius: '14px', color: result.color }}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>{result.categoryName}</h3>
        </div>
        <div style={{ 
          background: result.color + '15', 
          color: result.color, 
          padding: '6px 16px', 
          borderRadius: '999px', 
          fontSize: '0.95rem', 
          fontWeight: 800 
        }}>
          {result.severityLabel}
        </div>
      </div>
      
      {/* Meter Bar */}
      <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ 
          width: Math.max(2, percentage) + '%', 
          height: '100%', 
          background: result.color,
          borderRadius: '999px',
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>

      <p style={{ margin: 0, color: '#475569', lineHeight: '1.7', fontSize: '1rem' }}>
        {result.message}
      </p>
    </div>
  );
}

export function AssessmentReport({ report, onComplete }) {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
          width: '56px', height: '56px', borderRadius: '50%', 
          background: '#f0f9ff', color: '#0284c7', marginBottom: '20px',
          boxShadow: '0 4px 10px rgba(2, 132, 199, 0.1)'
        }}>
          <Activity size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h1)', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
          Your Wellbeing Report
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', margin: '0 auto', maxWidth: '600px', lineHeight: '1.7' }}>
          Thank you for completing the assessment. We've generated a clear, personalized overview of your emotional well-being to help guide your journey.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {report.results.map((result, idx) => (
          <CategoryMeter key={idx} result={result} />
        ))}
      </div>

      <div style={{ 
        marginTop: '32px', 
        padding: '36px 24px', 
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', 
        borderRadius: '24px', 
        border: '1px solid #bae6fd', 
        textAlign: 'center',
        boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.15)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 'var(--text-h2)', color: '#0369a1', fontWeight: 800 }}>
          Ready to take the next step?
        </h3>
        <p style={{ margin: '0 auto 32px', color: '#334155', fontSize: '1rem', lineHeight: '1.7', maxWidth: '500px' }}>
          Our licensed therapists are here to support you. Explore our therapy plans and find the right professional to help you navigate these feelings.
        </p>
        <button 
          onClick={() => {
            window.open('https://web.mantracare.com/plans/therapy', '_blank');
            if (onComplete) onComplete();
          }}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '14px 32px', fontSize: '1.05rem', fontWeight: 800,
            cursor: 'pointer', borderRadius: '999px', border: 'none', 
            background: '#0284c7', color: '#ffffff',
            boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)',
            transition: 'transform 0.2s, boxShadow 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>Explore Therapy Plans</span>
          <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/components/assessment/AssessmentReport.jsx', reportContent);
console.log('AssessmentReport rewritten to baseline structure with V2 polish.');
