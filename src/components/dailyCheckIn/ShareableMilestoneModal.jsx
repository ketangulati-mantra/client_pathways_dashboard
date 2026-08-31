import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, ArrowLeft } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import ShareableMilestoneCard from './ShareableMilestoneCard';

export default function ShareableMilestoneModal({
  milestoneNumber = 7,
  achievedAt,
  onBack,
  onClose
}) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Generates high-res blob from card
  const generateCardBlob = async () => {
    if (!cardRef.current) return null;
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    return await toBlob(cardRef.current, {
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#0B1522'
    });
  };

  // 1. Share Action: Uses Native Web Share API with image file blob
  const handleShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setFeedbackMessage('');

    try {
      const blob = await generateCardBlob();
      if (!blob) throw new Error('Failed to generate card image');

      const fileName = `Mantra-Milestone-${milestoneNumber}-Days.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareText = `🔥 ${milestoneNumber} Day Check-In Streak on Mantra! I've made time for myself for ${milestoneNumber} days in a row. #Mantra`;

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Mantra Daily Check-In, ${milestoneNumber} Day Streak`,
          text: shareText,
          files: [file]
        });
        setFeedbackMessage('Shared successfully!');
      } else {
        // Fallback for Desktop & Unsupported Browsers: Download + Copy caption
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2.5, backgroundColor: '#0B1522' });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText).catch(() => {});
        }
        setFeedbackMessage('Card saved to your device! Caption copied to clipboard.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Share error fallback to download:', err);
        handleSaveImage();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Save Image Action: Direct High-Res Download
  const handleSaveImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setFeedbackMessage('');

    try {
      if (!cardRef.current) return;
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.5,
        backgroundColor: '#0B1522'
      });

      const fileName = `Mantra-Milestone-${milestoneNumber}-Days.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setFeedbackMessage('Card saved to your device!');
    } catch (err) {
      console.error('Error saving image:', err);
      setFeedbackMessage('Could not save image directly. Please take a screenshot.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(11, 21, 34, 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(16px, 3vh, 28px) 16px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      {/* Top Bar: Back & Close */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to celebration"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 8px',
            outline: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close share preview"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          <X size={18} strokeWidth={2.4} />
        </button>
      </div>

      {/* Centerpiece: Live Keepsake Card Preview */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '340px',
          margin: 'auto 0',
          position: 'relative',
          zIndex: 5
        }}
      >
        <ShareableMilestoneCard
          ref={cardRef}
          milestoneNumber={milestoneNumber}
          achievedAt={achievedAt}
        />
      </div>

      {/* Bottom Action Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '340px',
          zIndex: 10
        }}
      >
        {/* Feedback Banner */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '8px 14px',
                color: '#fbbf24',
                fontSize: '0.82rem',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Share Action */}
        <motion.button
          type="button"
          onClick={handleShare}
          disabled={isGenerating}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            border: 'none',
            borderRadius: '9999px',
            padding: '14px 28px',
            color: '#ffffff',
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: '0.98rem',
            fontWeight: 700,
            cursor: isGenerating ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 10px 28px -4px rgba(249, 115, 22, 0.5)',
            opacity: isGenerating ? 0.7 : 1
          }}
        >
          <Share2 size={16} strokeWidth={2.4} />
          <span>{isGenerating ? 'Generating card...' : 'Share'}</span>
        </motion.button>

        {/* Secondary Save Image & Tertiary Skip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={isGenerating}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              padding: '10px 16px',
              color: '#cbd5e1',
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: isGenerating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <Download size={14} strokeWidth={2.2} />
            <span>Save image</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '9999px',
              padding: '10px 16px',
              color: '#94a3b8',
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
}
