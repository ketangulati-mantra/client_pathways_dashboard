const fs = require('fs');

const cardContent = `import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function AssessmentQuestionCard({ 
  question, 
  currentValue, 
  onSelect,
  onNext,
  onPrev,
  isFirst,
  isLast,
  progressPercentage
}) {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Clear states when question changes (just in case React reuses the component despite the key)
  useEffect(() => {
    setIsAdvancing(false);
    setIsExiting(false);
  }, [question.id]);

  const handleOptionChange = (val) => {
    if (isAdvancing || isExiting) return;
    
    onSelect(val);
    
    if (!isLast) {
      setIsAdvancing(true);
      
      // Delay to let the user see their selection
      setTimeout(() => {
        setIsExiting(true); // Trigger exit animation if we want one
        
        // Short delay for exit animation before actual navigation
        setTimeout(() => {
          onNext();
        }, 150);
        
      }, 400);
    }
  };

  const handleNextClick = () => {
    if (isAdvancing || isExiting) return;
    onNext();
  };

  return (
    <div 
      className="animate-slide-up" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        maxWidth: '800px', 
        margin: '0 auto',
        background: '#ffffff',
        position: 'relative',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
      }}
    >
      
      {/* Top Header Section (Fixed) */}
      <div style={{ padding: '24px 16px 12px', flexShrink: 0 }}>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: '#3b82f6', 
            width: \`\${progressPercentage}%\`, 
            transition: 'width 0.3s ease-out' 
          }} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h2)', fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: '1.3' }}>
          {question.text}
        </h2>
      </div>

      {/* Options Scrollable Region */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {question.options.map((opt, idx) => (
          <label 
            key={idx}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 16px', 
              background: currentValue === opt.value ? '#eff6ff' : '#ffffff',
              border: currentValue === opt.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: isAdvancing ? 'default' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: currentValue === opt.value ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <input 
              type="radio" 
              name={\`q-\${question.id}\`} 
              value={opt.value}
              checked={currentValue === opt.value}
              onChange={() => handleOptionChange(opt.value)}
              disabled={isAdvancing}
              style={{ display: 'none' }} 
            />
            
            <div style={{ 
              width: '20px', height: '20px', borderRadius: '50%', 
              border: currentValue === opt.value ? '6px solid #3b82f6' : '2px solid #cbd5e1',
              marginRight: '12px',
              transition: 'all 0.15s',
              flexShrink: 0
            }} />
            
            <span style={{ fontSize: '0.95rem', color: currentValue === opt.value ? '#1e40af' : '#475569', fontWeight: currentValue === opt.value ? 600 : 400, lineHeight: '1.4' }}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      {/* Bottom Action Bar (Fixed/Docked) */}
      <div style={{ 
        flexShrink: 0,
        padding: '16px', 
        display: 'flex', 
        justifyContent: 'space-between',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc'
      }}>
        <button 
          onClick={onPrev} 
          disabled={isFirst || isAdvancing}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px', 
            padding: '8px 16px', fontSize: '0.95rem', cursor: (isFirst || isAdvancing) ? 'not-allowed' : 'pointer', 
            borderRadius: '8px', border: '1px solid #cbd5e1', 
            background: '#ffffff', color: isFirst ? '#94a3b8' : '#334155',
            opacity: isFirst ? 0 : 1 
          }}
        >
          <ArrowLeft size={16} />
          <span>Prev</span>
        </button>

        <button 
          onClick={handleNextClick} 
          disabled={currentValue === undefined || isAdvancing}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px', 
            padding: '8px 24px', fontSize: '0.95rem', fontWeight: 600,
            cursor: (currentValue === undefined || isAdvancing) ? 'not-allowed' : 'pointer', 
            borderRadius: '8px', border: 'none', 
            background: currentValue === undefined ? '#cbd5e1' : '#3b82f6', 
            color: '#ffffff',
            transition: 'background 0.2s'
          }}
        >
          <span>{isLast ? 'Generate Report' : 'Next'}</span>
          {!isLast && <ArrowRight size={16} />}
        </button>
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/components/assessment/AssessmentQuestionCard.jsx', cardContent);
console.log('AssessmentQuestionCard updated with auto-advance and exit animations.');
