import React, { useState, useEffect, useRef } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { isValidEmail } from '../mantra/validation';
import { completeLesson, goToDashboard } from '../mantra';
import { Upload, X, FileImage, CheckCircle2, Clock, Award, Mail } from 'lucide-react';

const LESSON_ID = 'market-yourself';
const LESSON_TITLE = 'Market Yourself & Grow Faster';
const REWARD_POINTS = 5;

const STEPS = [
  {
    step: 'Step 1',
    title: 'Complete Your Profile',
    items: ['Add profile photo', 'Update qualifications', 'Add experience & services']
  },
  {
    step: 'Step 2',
    title: 'Promote Yourself',
    content: 'Share your MantraCare profile OR create useful content mentioning MantraCare.',
    platforms: ['LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'Reddit', 'YouTube', 'Quora']
  },
  {
    step: 'Step 3',
    title: 'Capture Proof',
    content: 'Take a screenshot of:',
    items: ['your shared profile', 'or', 'your published content']
  },
  {
    step: 'Step 4',
    title: 'Submit',
    content: 'Upload your screenshot using the form below. Each valid submission earns engagement points. This task can be completed multiple times.'
  }
];

export default function MarketYourselfLessonPage({ onBack }) {


  const { 
    lessonProgress, 
    showCelebrate, 
    handleCloseCelebration, 
    handleActionComplete 
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasQuiz: false,
    hasAction: true
  });

  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const validateEmail = () => {
    if (!email) return true;
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'warning');
      return false;
    }
    return true;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value.replace(/\s/g, ''));
  };

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (validTypes.includes(selectedFile.type) && selectedFile.size <= 20 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PNG, JPG, or PDF file under 20MB.");
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    if (!file) return;
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setLessonProgress(100);
      setTimeout(() => setShowCelebrate(true), 800);
    }, 1200);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}
      className="animate-fade-in"
    >
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1,
        padding: '28px 24px 60px',
        maxWidth: '860px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #eef0f3',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-main)', margin: '0 0 8px' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.5', maxWidth: '600px' }}>
            Increase your visibility, attract more clients and earn engagement points by promoting your MantraCare profile online.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={12} /><span>5 min task</span></span>
            <span className="overview-meta-badge points"><Award size={12} /><span>+{REWARD_POINTS} Points</span></span>
          </div>
        </div>

        {/* ── 2x2 Steps Grid ────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Step 1 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eef0f3', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>{STEPS[0].step}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px' }}>{STEPS[0].title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {STEPS[0].items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eef0f3', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>{STEPS[1].step}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{STEPS[1].title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: '1.5' }}>{STEPS[1].content}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {STEPS[1].platforms.map((platform, idx) => (
                <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', background: '#f3f4f6', padding: '4px 10px', borderRadius: '20px' }}>
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eef0f3', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>{STEPS[2].step}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{STEPS[2].title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>{STEPS[2].content}</p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <li>{STEPS[2].items[0]}</li>
              <li style={{ listStyle: 'none', marginLeft: '-20px', color: '#9ca3af', fontSize: '0.75rem', fontStyle: 'italic' }}>{STEPS[2].items[1]}</li>
              <li>{STEPS[2].items[2]}</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eef0f3', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>{STEPS[3].step}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{STEPS[3].title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{STEPS[3].content}</p>
          </div>
        </div>

        {/* ── Form Section ────────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #eef0f3',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)', margin: '0 0 24px' }}>
            Submit Your Proof
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="academy-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Name</label>
                <input type="text" placeholder="Name" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#1f2937', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Email</label>
                <input type="email" value={email} onChange={handleEmailChange} onBlur={validateEmail} placeholder="Email Address" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#1f2937', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Screenshot Upload</label>
              <div 
                onClick={triggerFileSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ 
                  border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed #d1d5db',
                  borderRadius: '12px',
                  background: isDragging ? '#f0f9ff' : '#f9fafb',
                  padding: '32px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  gap: '12px'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept=".png,.jpg,.jpeg,.pdf" 
                  style={{ display: 'none' }} 
                />
                
                {!file ? (
                  <>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <Upload size={20} color="var(--color-primary)" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Drag & drop your screenshot</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>or <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Browse Files</span></p>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>PNG, JPG, JPEG, PDF up to 20MB</p>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '400px', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <FileImage size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span onClick={triggerFileSelect} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', padding: '4px 8px' }}>Replace</span>
                      <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              className="academy-btn-full"
              variant="primary"
              type="submit"
              disabled={!file || isSubmitting}
              style={{ padding: '14px', fontSize: '0.95rem', width: '100%', marginTop: '8px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Activity'}
            </Button>
          </form>
        </div>

        {/* ── Footer Info ────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f1f5f9', padding: '16px 20px', borderRadius: '12px' }}>
          <Mail size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Need to submit again?</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Email additional proofs to <a href="mailto:Provider@mantra.care" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Provider@mantra.care</a> with the subject <strong>Provider Activity Submission Proof</strong>. Please use your registered email address.
            </p>
          </div>
        </div>

      </main>

      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Activity Complete!"
          subtitle="Your submission has been received. Points have been added to your profile."
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
