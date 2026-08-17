import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { HelpCircle, X, CheckSquare, Square } from 'lucide-react';

const AVAILABLE_FIELDS = [
  { id: 'college', label: 'University / College Name' },
  { id: 'motivation', label: 'Statement of Motivation' },
  { id: 'linkedin_url', label: 'LinkedIn Profile Link' },
  { id: 'phone', label: 'Phone Contact Number' },
  { id: 'availability', label: 'Weekly Hours Availability' },
  { id: 'previous_experience', label: 'Leadership / Advocacy Experience' }
];

export default function RequestMoreInfoModal({ isOpen, onClose, onSubmit, applicantName }) {
  const [selectedFields, setSelectedFields] = useState(['motivation']);
  const [reviewerNotes, setReviewerNotes] = useState('');

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleField = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      requestedFields: selectedFields,
      reviewerNotes: reviewerNotes.trim()
    });
  };

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #fed7aa',
          maxWidth: '520px',
          width: '100%',
          padding: '26px 28px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          position: 'relative'
        }}
      >
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              Request Additional Information
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Applicant: <strong>{applicantName || 'Candidate'}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Select Requested Information Fields:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {AVAILABLE_FIELDS.map(f => {
                const isSelected = selectedFields.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleField(f.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                      background: isSelected ? '#fff7ed' : '#f8fafc',
                      color: isSelected ? '#c2410c' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSelected ? <CheckSquare size={15} color="#ea580c" /> : <Square size={15} color="#cbd5e1" />}
                    <span>{f.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Reviewer Notes / Guidance for Applicant:
            </label>
            <textarea
              rows={3}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Provide clear guidance for the applicant (e.g. Please clarify your campus leadership role and update motivation)..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.86rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '99px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 18px',
                borderRadius: '99px',
                border: 'none',
                background: '#ea580c',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              Send Information Request
            </button>
          </div>

        </form>

      </div>

    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
