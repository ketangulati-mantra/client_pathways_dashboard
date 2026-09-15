const fs = require('fs');

const reportContent = `import React, { useEffect, useState } from 'react';
import { ArrowRight, HeartPulse, BrainCircuit, Cloud, Sparkles, Activity } from 'lucide-react';

// Map categories to specific icons
const CATEGORY_ICONS = {
  depression: Cloud,
  anxiety: HeartPulse,
  stress: BrainCircuit
};

// 1. Circular Progress Component
const CircularProgress = ({ percentage, color, size = 80, strokeWidth = 8 }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Delay animation slightly for effect
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Percentage Text inside circle */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', fontWeight: 700, color: '#0f172a'
      }}>
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

// 2. Individual Category Meter Card
export function CategoryMeter({ result }) {
  const percentage = (result.score / result.maxPossibleScore) * 100;
  const Icon = CATEGORY_ICONS[result.categoryId.toLowerCase()] || Activity;

  return (
    <div className="animate-slide-up" style={{ 
      background: '#ffffff', 
      padding: '20px', 
      borderRadius: '20px', 
      border: '1px solid #e2e8f0', 
      boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)', 
      marginBottom: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: \`\${result.color}15\`, borderRadius: '12px', color: result.color }}>
              <Icon size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{result.categoryName}</h3>
          </div>
          
          <div style={{ 
            display: 'inline-block', 
            background: \`\${result.color}15\`, 
            color: result.color, 
            padding: '4px 12px', 
            borderRadius: '999px', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            marginBottom: '12px' 
          }}>
            {result.severityLabel}
          </div>

          <p style={{ margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {result.message}
          </p>
        </div>
        
        {/* Circular Gauge */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <CircularProgress percentage={percentage} color={result.color} size={70} strokeWidth={6} />
        </div>
      </div>
    </div>
  );
}

// 3. Premium Action Card
const PremiumActionCard = () => {
  return (
    <div className="animate-scale-in" style={{ 
      marginTop: '32px', 
      padding: '32px 24px', 
      background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', 
      borderRadius: '24px', 
      border: '1px solid #bae6fd', 
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.15)'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', color: '#0284c7', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <Sparkles size={24} />
        </div>
        <h3 style={{ margin: '0 0 12px', fontSize: 'var(--text-h2)', color: '#0369a1', fontWeight: 800 }}>Ready to take the next step?</h3>
        <p style={{ margin: '0 auto 24px', color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '400px' }}>
          Our licensed therapists can help you understand these results and build a personalized recovery plan tailored to you.
        </p>
        <button 
          onClick={() => window.open('https://web.mantracare.com/plans/therapy', '_blank')}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '14px 28px', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', borderRadius: '999px', border: 'none', 
            background: '#0284c7', color: '#ffffff',
            boxShadow: '0 4px 14px 0 rgba(2, 132, 199, 0.39)',
            transition: 'transform 0.2s, boxShadow 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>Explore Therapy Plans</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// 4. Main Report Component
export function AssessmentReport({ report, onComplete }) {
  // Compute Overall Wellbeing
  // Logic: Find the highest severity category to represent overall state
  const SEVERITY_ORDER = { 'Minimal': 0, 'Mild': 1, 'Moderate': 2, 'Severe': 3, 'Extremely Severe': 4 };
  let highestResult = report.results[0];
  
  report.results.forEach(r => {
    if (SEVERITY_ORDER[r.severityLabel] > SEVERITY_ORDER[highestResult.severityLabel]) {
      highestResult = r;
    }
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '32px' }}>
      
      {/* Overall Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px', background: '#f8fafc', padding: '32px 24px', borderRadius: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 24px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Emotional Wellbeing
        </h2>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 24px', background: '#ffffff', borderRadius: '999px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: highestResult.color }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>{highestResult.severityLabel}</span>
        </div>

        <h3 style={{ fontSize: 'var(--text-h2)', color: '#0f172a', fontWeight: 800, margin: '0 0 16px' }}>
          Overall Status
        </h3>
        
        <p style={{ fontSize: '1rem', color: '#475569', margin: '0 auto', maxWidth: '500px', lineHeight: '1.7' }}>
          {highestResult.severityLabel === 'Minimal' || highestResult.severityLabel === 'Mild' 
            ? "You're showing strong emotional resilience right now. Continue practicing your healthy daily habits to maintain this balance."
            : "You've shown some signs of stress or anxiety recently. The good news is these appear manageable and many people improve with the right support."}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {report.results.map((result, idx) => (
          <CategoryMeter key={idx} result={result} />
        ))}
      </div>

      <PremiumActionCard />

      {/* Invisible trigger to satisfy the lesson flow if needed */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        <button 
          onClick={onComplete}
          style={{ 
            background: 'none', border: 'none', color: '#94a3b8', 
            fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' 
          }}
        >
          Close Report & Return to Dashboard
        </button>
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/components/assessment/AssessmentReport.jsx', reportContent);
console.log('Report updated.');
