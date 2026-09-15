import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import EmotionWrappedSlide from './EmotionWrappedSlide';
import { generateEmotionWrappedStory } from './emotionWrappedEngine';

export default function EmotionWrappedModal({
  emotion,
  family,
  intensity = 3,
  selectedContexts = [],
  selectedNeeds = [],
  onClose
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const slideRef = useRef(null);

  const themeColor = family?.color || '#38bdf8';
  const emotionName = emotion?.name || 'This feeling';
  const familyName = family?.name || 'Feeling';

  const slides = useMemo(() => {
    return generateEmotionWrappedStory({
      emotionName,
      familyName,
      intensity,
      selectedContexts,
      selectedNeeds
    });
  }, [emotionName, familyName, intensity, selectedContexts, selectedNeeds]);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  // Generates high-res image blob for active slide
  const generateSlideBlob = async () => {
    if (!slideRef.current) return null;
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    return await toBlob(slideRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: '#06090f'
    });
  };

  // 1. Share Action: Native Web Share API with image file blob
  const handleShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setFeedbackMessage('');

    try {
      const blob = await generateSlideBlob();
      if (!blob) throw new Error('Failed to generate slide image');

      const cleanEmotion = emotionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `Emotion-Wrapped-${cleanEmotion}-Slide${currentSlideIndex + 1}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareText = `My Emotion Wrapped: ${emotionName}. #TherapyMantra #EmotionWrapped`;

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `My Emotion Wrapped: ${emotionName}`,
          text: shareText,
          files: [file]
        });
        setFeedbackMessage('Shared slide successfully!');
      } else {
        // Fallback for Desktop & Unsupported Browsers: Direct high-res download
        const dataUrl = await toPng(slideRef.current, { pixelRatio: 3, backgroundColor: '#06090f' });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText).catch(() => {});
        }
        setFeedbackMessage('Slide saved to your device!');
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
      if (!slideRef.current) return;
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const cleanEmotion = emotionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `Emotion-Wrapped-${cleanEmotion}-Slide${currentSlideIndex + 1}.png`;

      const dataUrl = await toPng(slideRef.current, {
        pixelRatio: 3,
        backgroundColor: '#06090f'
      });

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setFeedbackMessage('Slide saved to your photos!');
    } catch (err) {
      console.error('Error saving slide image:', err);
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
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(4, 7, 12, 0.96)',
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
          gap: '14px',
          margin: 'auto'
        }}
      >
        {/* Top Header Bar & Progress Track */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
            {slides.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                style={{
                  flex: 1,
                  height: '3px',
                  borderRadius: '2px',
                  background:
                    idx === currentSlideIndex
                      ? themeColor
                      : idx < currentSlideIndex
                      ? 'rgba(255, 255, 255, 0.4)'
                      : 'rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  transition: 'background 0.25s ease'
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color={themeColor} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                My Emotion Wrapped
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Emotion Wrapped"
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
        </div>

        {/* 9:16 Story Carousel Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Prev Slide Navigation Overlay */}
          {currentSlideIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '-16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Current Story Slide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <EmotionWrappedSlide
                ref={slideRef}
                slide={activeSlide}
                family={family}
                emotion={emotion}
                index={currentSlideIndex}
                total={slides.length}
              />
            </motion.div>
          </AnimatePresence>

          {/* Next Slide Navigation Overlay */}
          {currentSlideIndex < slides.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '-16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Feedback Banner */}
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

        {/* Action Controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <motion.button
            type="button"
            onClick={handleShare}
            disabled={isGenerating}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              background: `linear-gradient(135deg, ${themeColor} 0%, #2563eb 100%)`,
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
              boxShadow: `0 8px 24px -4px ${themeColor}50`
            }}
          >
            <Share2 size={16} />
            <span>{isGenerating ? 'Preparing story...' : 'Share to Instagram Story'}</span>
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
            <span>Save current slide</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
