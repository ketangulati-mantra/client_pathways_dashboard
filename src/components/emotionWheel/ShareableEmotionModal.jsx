import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Sparkles, Check } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import ShareableEmotionCard from './ShareableEmotionCard';
import { SHARE_STYLES } from './shareCopyEngine';

export default function ShareableEmotionModal({
  emotion,
  family,
  intensity = 3,
  selectedContexts = [],
  selectedNeeds = [],
  onClose
}) {
  const cardRef = useRef(null);
  const [selectedStyleId, setSelectedStyleId] = useState('relatable');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const emotionName = emotion?.name || 'Provoked';

  // Generates high-res blob from card
  const generateCardBlob = async () => {
    if (!cardRef.current) return null;
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    return await toBlob(cardRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: '#070c14'
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

      const cleanEmotion = emotionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `Mantra-Story-${cleanEmotion}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareText = `Today's reflection. #Mantra #SelfCare`;

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Reflection: ${emotionName}`,
          text: shareText,
          files: [file]
        });
        setFeedbackMessage('Shared successfully!');
      } else {
        // Fallback for Desktop & Unsupported Browsers: Download + Copy caption
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: '#070c14' });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText).catch(() => {});
        }
        setFeedbackMessage('Story saved to your photos!');
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

      const cleanEmotion = emotionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `Mantra-Story-${cleanEmotion}.png`;

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: '#070c14'
      });

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setFeedbackMessage('Saved image to your photos!');
    } catch (err) {
      console.error('Error saving image:', err);
      setFeedbackMessage('Could not save image directly. Please take a screenshot.');
    } finally {
      setIsGenerating(false);
    }
  };

  const themeColor = family?.color || '#38bdf8';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5, 9, 15, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          margin: 'auto'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color={themeColor} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.04em'
              }}
            >
              Shareable Reflection
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share preview"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* 9:16 Social Story Preview Card */}
        <motion.div
          key={selectedStyleId}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <ShareableEmotionCard
            ref={cardRef}
            emotion={emotion}
            family={family}
            intensity={intensity}
            selectedContexts={selectedContexts}
            selectedNeeds={selectedNeeds}
            styleId={selectedStyleId}
          />
        </motion.div>

        {/* Style Selector Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            overflowX: 'auto',
            padding: '4px 0'
          }}
        >
          {SHARE_STYLES.map((style) => {
            const isSelected = style.id === selectedStyleId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyleId(style.id)}
                style={{
                  background: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? `1.5px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                  fontSize: '12px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                {style.label}
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '10px',
                padding: '6px 14px',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <motion.button
            type="button"
            onClick={handleShare}
            disabled={isGenerating}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '13px 24px',
              color: '#ffffff',
              fontSize: '14.5px',
              fontWeight: '700',
              cursor: isGenerating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Share2 size={16} />
            <span>{isGenerating ? 'Preparing story...' : 'Share to Story'}</span>
          </motion.button>

          <button
            type="button"
            onClick={handleSaveImage}
            disabled={isGenerating}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 16px',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isGenerating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            <span>Save image</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
