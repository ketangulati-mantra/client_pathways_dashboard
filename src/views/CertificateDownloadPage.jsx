import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Header, Button, useToast } from '../components';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

/* ==========================================================================
   Premium Certificate Component
   ========================================================================== */
const PremiumCertificate = ({ userName, innerRef, certificateId, config }) => {
  return (
    <div 
      ref={innerRef}
      style={{
        width: '100%',
        maxWidth: '1000px', // High resolution base
        minHeight: '750px', // Ensures it's tall enough but scales naturally if content grows
        margin: '0 auto',
        background: '#faf9f6', // Subtle ivory
        position: 'relative',
        padding: '24px', // Space for outer border
        boxSizing: 'border-box',
        color: '#0f172a'
        // Removed fixed aspectRatio to prevent content from spilling out of bounds
      }}
    >
      {/* Import Signature Font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}
      </style>

      {/* Outer Border (1.5px Gold) */}
      <div style={{
        position: 'absolute',
        top: '20px', left: '20px', right: '20px', bottom: '20px',
        border: '1.5px solid #d4af37',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        zIndex: 1
      }} />

      {/* Inner Border (1px Navy) */}
      <div style={{
        position: 'absolute',
        top: '28px', left: '28px', right: '28px', bottom: '28px',
        border: '1px solid #0f172a',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        zIndex: 1
      }}>
        {/* Corner Ornaments */}
        <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, border: '1px solid #d4af37', background: '#faf9f6' }} />
        <div style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, border: '1px solid #d4af37', background: '#faf9f6' }} />
        <div style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, border: '1px solid #d4af37', background: '#faf9f6' }} />
        <div style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, border: '1px solid #d4af37', background: '#faf9f6' }} />
      </div>

      {/* Main Content Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '70px 60px 80px', // Extra bottom padding (80px) to keep content well inside the border
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 2
      }}>
        
        {/* Hierarchy 1: Logo */}
        <img 
          src="/logo.svg" 
          alt="MantraCare" 
          style={{ height: '32px', marginBottom: '16px' }} 
          crossOrigin="anonymous"
        />

        {/* Hierarchy 2: Program Name */}
        <div style={{ 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em', 
          color: '#475569',
          marginBottom: '28px',
          fontWeight: 600
        }}>
          {config.programName}
        </div>

        {/* Hierarchy 3: Title */}
        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif", // Elegant Serif
          fontSize: '2rem', 
          fontWeight: 400,
          color: '#0f172a',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 20px 0'
        }}>
          {config.certificateTitle}
        </h1>
        
        {/* Hierarchy 4: Presented To */}
        <p style={{
          fontSize: '1rem',
          color: '#475569',
          margin: '0 0 20px 0'
        }}>
          {config.awardText}
        </p>

        {/* Hierarchy 5: Recipient Name */}
        <h2 style={{
          fontFamily: "'Great Vibes', 'Brush Script MT', cursive", // Signature Font
          fontSize: '4.5rem', // Large focal point
          fontWeight: 400,
          color: '#0f172a',
          margin: '0 0 24px 0',
          borderBottom: '2px solid #d4af37', // Gold underline
          paddingBottom: '4px',
          paddingLeft: '40px',
          paddingRight: '40px',
          minWidth: '50%',
          lineHeight: '1.1'
        }}>
          {userName || 'Your Name'}
        </h2>

        {/* Hierarchy 6: Achievement Text */}
        <div style={{
          fontSize: '1.05rem',
          color: '#334155',
          margin: '0 0 28px 0',
          maxWidth: '65%',
          lineHeight: '1.6'
        }}>
          {config.completionText}<br/>
          <strong>{config.courseName}</strong>
        </div>

        {/* Hierarchy 7: Quote */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 32px',
          marginBottom: '40px', 
          fontStyle: 'italic',
          color: '#475569',
          fontSize: '0.95rem',
          fontFamily: "Georgia, 'Times New Roman', serif"
        }}>
          {config.quote}
        </div>

        <div style={{ flex: 1 }} /> {/* Flexible spacer to push footer down */}

        {/* Hierarchy 8: Footer (3 Columns) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '75%', // Keep it slightly narrower so it doesn't touch the absolute positioned seal on the right
          marginBottom: '24px'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              fontFamily: "'Great Vibes', 'Brush Script MT', cursive",
              fontSize: '1.8rem',
              color: '#0f172a',
              borderBottom: '1px solid #cbd5e1',
              paddingBottom: '4px',
              marginBottom: '8px',
              width: '180px',
              lineHeight: '1'
            }}>
              MantraCare
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Authorized By
            </span>
            <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500, marginTop: '2px' }}>
              {config.authorizedBy}
            </span>
          </div>

          {/* Center Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              fontSize: '0.95rem',
              color: '#0f172a',
              fontFamily: 'monospace',
              borderBottom: '1px solid #cbd5e1',
              paddingBottom: '4px',
              marginBottom: '8px',
              width: '180px',
              paddingTop: '20px' // Visually align the baseline with the bottom of the signature
            }}>
              {certificateId}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Certificate ID
            </span>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              fontSize: '1rem',
              color: '#0f172a',
              borderBottom: '1px solid #cbd5e1',
              paddingBottom: '4px',
              marginBottom: '8px',
              width: '180px',
              paddingTop: '20px' // Visually align the baseline with the bottom of the signature
            }}>
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Date of Completion
            </span>
          </div>
        </div>

        {/* Small Bottom Center Footer */}
        <div style={{
          fontSize: '0.65rem',
          color: '#94a3b8',
          letterSpacing: '0.02em',
          marginTop: '0px'
        }}>
          {config.footer}
        </div>

      </div>

      {/* Corporate Verification Seal Absolute positioned lower-right */}
      {/* Positioned inside the bounds of the inner border (which is at 28px from edge) */}
      <div style={{
        position: 'absolute',
        bottom: '52px', // 24px clearance from the 28px inner border
        right: '52px',  // 24px clearance from the 28px inner border
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: '#ffffff',
        border: '3px solid #1e40af', // Corporate Blue border
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        zIndex: 10
      }}>
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          border: '1px solid #93c5fd', // Lighter blue inner ring
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc'
        }}>
          <ShieldCheck size={20} color="#1e40af" style={{ marginBottom: '2px' }} />
          <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#1e40af', letterSpacing: '0.05em' }}>VERIFIED</span>
          <span style={{ fontSize: '0.4rem', color: '#475569', marginTop: '2px', textAlign: 'center', lineHeight: '1.2', fontWeight: 600 }}>Issued by<br/>MantraCare</span>
        </div>
      </div>

    </div>
  );
};

/* ==========================================================================
   Page Component
   ========================================================================== */

const DEFAULT_CONFIG = {
  certificateTitle: 'Therapy Intern Provider Pathway',
  programName: 'MANTRACARE THERAPY INTERN PROVIDER PROGRAM',
  awardText: 'This certificate is proudly awarded to',
  completionText: 'for successfully completing the',
  courseName: 'Therapy Intern Provider Pathway',
  quote: '"Therapy is a sacred collaboration of self-discovery and healing. Your presence, guidance, and compassion support others in navigating life\'s challenges and finding their strength."',
  authorizedBy: 'MantraCare Therapy Intern Program',
  footer: 'Guiding minds and healing hearts. | mantracare.org',
  certificateIdPrefix: 'MC-TIPP',
  congratsHeading: 'Congratulations!',
  congratsBadge: null,
  congratsDescription: null
};

export default function CertificateDownloadPage({ onBack, certificateConfig, onDownload }) {
  const config = certificateConfig || DEFAULT_CONFIG;
  const { showToast } = useToast();
  const [step, setStep] = useState('form'); // 'form' | 'preview'
  const [userName, setUserName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  // Generate ID once per page load to remain stable
  const certificateId = useMemo(() => {
    const prefix = config.certificateIdPrefix || 'MC-CERT';
    return `${prefix}-${Math.floor(Math.random() * 9000000) + 1000000}`;
  }, [config.certificateIdPrefix]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast('Please enter your name.', 'warning');
      return;
    }
    setStep('preview');
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsDownloading(true);
      // Wait to ensure fonts and layout are completely settled
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 3, 
        cacheBust: true,
        backgroundColor: '#faf9f6'
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = `MantraCare-Certificate-${userName.trim().replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      showToast('Certificate downloaded successfully!', 'success');
      
      if (onDownload) {
        onDownload();
      }
    } catch (err) {
      console.error('Error generating certificate image:', err);
      showToast('Unable to download certificate. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      {step === 'form' ? (
        <>
          <Header title="Get Your Certificate" onBack={onBack} progress={100} points={0} />
          <main className="academy-main-container" style={{
            flex: 1,
            padding: '48px 24px',
            maxWidth: '600px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px 32px',
              border: '1px solid #eef0f3',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: '#d97706'
              }}>
                <CheckCircle2 size={32} />
              </div>
              
              {config.congratsBadge && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', borderRadius: '20px',
                  padding: '5px 14px', fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  marginBottom: '20px'
                }}>
                  {config.congratsBadge}
                </div>
              )}

              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)', margin: '0 0 12px' }}>
                {config.congratsHeading || 'Congratulations!'}
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0 0 32px', lineHeight: '1.5' }}>
                {config.congratsDescription || `You've completed the ${config.courseName}. Enter your name exactly as you want it to appear on your official certificate.`}
              </p>

              <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="E.g. Dr. Jane Doe"
                    required
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      background: '#ffffff', 
                      color: '#1f2937', 
                      fontSize: '1rem', 
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }} 
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <Button
                  className="academy-btn-full"
                  variant="primary"
                  type="submit"
                  style={{ padding: '14px', fontSize: '1rem', width: '100%', marginTop: '8px' }}
                >
                  Generate My Certificate
                </Button>
              </form>
            </div>
          </main>
        </>
      ) : (
        <>
          {/* Sticky Header for Preview */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <button 
              onClick={() => setStep('form')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={isDownloading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem'
              }}
            >
              {isDownloading ? <span className="animate-spin">⏳</span> : <Download size={16} />}
              <span>{isDownloading ? 'Generating...' : 'Download PNG'}</span>
            </Button>
          </div>

          <main style={{
            flex: 1,
            padding: '40px 24px',
            background: '#1e293b', // Dark background to make certificate pop
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowX: 'hidden'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '1000px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <PremiumCertificate userName={userName} innerRef={certificateRef} certificateId={certificateId} config={config} />
            </div>
          </main>
        </>
      )}
    </div>
  );
}
