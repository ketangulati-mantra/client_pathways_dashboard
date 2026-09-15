import React, { useState, useRef, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { isValidEmail } from '../mantra/validation';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Upload, X, FileImage, CheckCircle2, Clock, Award, 
  UserCircle, Eye, Heart, Star, ExternalLink, ShieldCheck
} from 'lucide-react';

const LESSON_ID = 'show-achievements';
const LESSON_TITLE = 'Show Your Achievements & Earn Rewards!';
const REWARD_POINTS = 5;

const BENEFITS = [
  { icon: Award, title: 'Professional Credibility', desc: 'Showcase your certification publicly to build trust.' },
  { icon: UserCircle, title: 'Grow Your Personal Brand', desc: 'Highlight your professional achievements online.' },
  { icon: Eye, title: 'Increase Visibility', desc: 'Help more people discover your MantraCare profile.' },
  { icon: Star, title: 'Earn Provider Points', desc: 'Verified submissions contribute toward your Provider Engagement Score.' }
];

const GUIDELINES = [
  'Maintain complete client confidentiality.',
  'Keep all content professional and ethical.',
  'Certification details should be accurate.',
  'Points are awarded only after successful verification.'
];

export default function ShowAchievementsLessonPage({ onBack }) {


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
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  // Use a useEffect for the completion progress trigger
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
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
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
            Your MantraCare certification represents your expertise and professional commitment. Showcase your achievement on LinkedIn to strengthen your credibility while earning Provider Engagement Points.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={12} /><span>5 min</span></span>
            <span className="overview-meta-badge points"><Award size={12} /><span>+{REWARD_POINTS} Points</span></span>
          </div>
        </div>

        {/* ── Section 1: Why This Matters ───────────────────────── */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>Why This Matters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {BENEFITS.map((b, idx) => (
              <div key={idx} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eef0f3', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', color: 'var(--color-primary)' }}>
                  <b.icon size={16} />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{b.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: How It Works ──────────────────────────── */}
        <section className="academy-flex-row" style={{ display: 'flex', gap: '24px' }}>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>How It Works</h2>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eef0f3', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div style={{ width: '2px', flex: 1, background: '#eef0f3', marginTop: '4px' }}></div>
                </div>
                <div style={{ paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-main)' }}>Add your certification on LinkedIn.</h4>
                  <Button variant="secondary" onClick={() => window.open('https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&organizationName=MantraCare&organizationId=67906788&issueYear=2026', '_blank')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', marginBottom: '12px' }}>
                    Add Certification on LinkedIn <ExternalLink size={14} />
                  </Button>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <li>Select "MantraCare" as the organization.</li>
                    <li>Paste your MantraCare profile URL into the Credential URL field.</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div style={{ width: '2px', flex: 1, background: '#eef0f3', marginTop: '4px' }}></div>
                </div>
                <div style={{ paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>Create a LinkedIn post announcing your certification.</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>Suggestions:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <li>Celebrate earning your certification.</li>
                    <li>Explain what you've learned.</li>
                    <li>Tag MantraCare in your post.</li>
                    <li>Share how it helps you support clients.</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div style={{ width: '2px', flex: 1, background: '#eef0f3', marginTop: '4px' }}></div>
                </div>
                <div style={{ paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Take a screenshot of your published LinkedIn post.</h4>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>4</div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Upload the screenshot below.</h4>
                </div>
              </div>

            </div>
          </div>
          
          <div className="academy-w-full" style={{ width: '300px', flexShrink: 0 }}>
            {/* ── Section 3: Important Guidelines ──────────────────────── */}
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>Important Guidelines</h2>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eef0f3', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {GUIDELINES.map((guide, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{guide}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ── Section 4: Submit Your Proof ─────────────────────────── */}
        <section>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #eef0f3',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            {!isSuccess ? (
              <>
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
                    {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                  </Button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 0', animation: 'fade-in 0.3s ease-out' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <ShieldCheck size={32} color="#059669" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)', margin: '0 0 8px' }}>
                  Proof Submitted Successfully
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 4px', maxWidth: '400px', lineHeight: '1.5' }}>
                  Your certification submission has been received and is awaiting verification.
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 24px', maxWidth: '400px', lineHeight: '1.5' }}>
                  Provider Engagement Points will be awarded after approval.
                </p>
                <Button className="academy-btn-full" variant="primary" onClick={handleActionComplete} style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
                  Mark Lesson as Complete
                </Button>
              </div>
            )}
          </div>
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Activity Complete!"
          subtitle="You have successfully finished this task. Points will be awarded upon manual verification."
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
