import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Sparkles, Copy, Check, MessageCircle } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import ShareableEmotionalSnapshotCard from './ShareableEmotionalSnapshotCard';
import { deriveSnapshotIdentity } from './snapshotInsightEngine';

/**
 * ShareableEmotionalSnapshotModal:
 * - Phone View: Primary "Share to Instagram Story" (Downloads image to photos & deep-links directly to Instagram story camera) + "Save Image"
 * - Web View: "Save Image", "Share on WhatsApp", and "Copy Reflection"
 */
export default function ShareableEmotionalSnapshotModal({
  emotion,
  family,
  intensity = 3,
  selectedContexts = [],
  selectedNeeds = [],
  onClose
}) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const emotionName = emotion?.name || 'Provoked';

  useEffect(() => {
    const checkMobile = () => {
      const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const isMobileUA = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent || '');
      setIsMobile(isMobileUA || (isTouch && window.innerWidth < 768));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { vibeTag, identityStatement, reflectionBody, takeThisWithYou } =
    deriveSnapshotIdentity({
      emotionName,
      familyName: family?.name || 'Feeling',
      intensity,
      selectedContexts,
      selectedNeeds
    });

  const googlePlayUrl = 'https://play.google.com/store/apps/details?id=org.mantracare.therapy';
  const appStoreUrl = 'https://apps.apple.com/in/app/therapymantra/id1607643888';

  // Rich, beautifully formatted WhatsApp viral share message with snapshot card summary & app links
  const whatsAppShareMessage = `✨ *MY EMOTIONAL SNAPSHOT* ✨

*Feeling:* ${emotionName.toUpperCase()} (${family?.name || 'Feeling'} · ${intensity}/5)
_${vibeTag}_

*What this revealed:*
"${identityStatement.replace(/\n/g, ' ')}"

${reflectionBody}

💡 *Takeaway:* "${takeThisWithYou}"

━━━━━━━━━━━━━━━━━━━━
📲 *Discover what your feelings are telling you:*
• Android: ${googlePlayUrl}
• iOS: ${appStoreUrl}`;

  const shareText = `My Emotional Snapshot: ${emotionName} (${family?.name || 'Feeling'} · ${intensity}/5) — "${identityStatement.replace(/\n/g, ' ')}". Discover yours on TherapyMantra: https://therapymantra.co`;

  // 1. Helper to generate high-res image blob
  const generateCardBlob = async () => {
    if (!cardRef.current) return null;
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    return await toBlob(cardRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: '#ffffff'
    });
  };

  // 2. Direct Save / Download High-Res Image
  const handleSaveImage = async (silent = false) => {
    if (isGenerating && !silent) return;
    setIsGenerating(true);
    if (!silent) setFeedbackMessage('');

    try {
      if (!cardRef.current) return;
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const cleanEmotion = emotionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `TherapyMantra-Snapshot-${cleanEmotion}.png`;

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      if (!silent) {
        setFeedbackMessage('Saved snapshot to your photos / downloads!');
      }
    } catch (err) {
      console.error('Error saving image:', err);
      if (!silent) {
        setFeedbackMessage('Could not save image directly. Please take a screenshot.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Mobile Instagram Story Share Flow:
  // Saves photo to device -> Attempts WebShare -> Launches Instagram deep link
  const handleInstagramStoryShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setFeedbackMessage('Preparing snapshot for Instagram...');

    try {
      const blob = await generateCardBlob();
      const cleanEmotion = emotionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `TherapyMantra-Snapshot-${cleanEmotion}.png`;

      let sharedViaSheet = false;

      // 1. Try Native Share Sheet with file
      if (
        blob &&
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], fileName, { type: 'image/png' })] })
      ) {
        try {
          const file = new File([blob], fileName, { type: 'image/png' });
          await navigator.share({
            title: `Emotional Snapshot: ${emotionName}`,
            text: shareText,
            files: [file]
          });
          sharedViaSheet = true;
          setFeedbackMessage('Shared successfully!');
        } catch (shareErr) {
          // User canceled or share error
          if (shareErr.name === 'AbortError') {
            setIsGenerating(false);
            return;
          }
        }
      }

      // 2. If not shared via native sheet, save the image & deep link to Instagram Camera
      if (!sharedViaSheet) {
        // Trigger image download
        await handleSaveImage(true);

        setFeedbackMessage('Saved to Photos! Opening Instagram...');

        // Deep link to Instagram Story Camera / App
        setTimeout(() => {
          window.location.href = 'instagram://story-camera';
          // Fallback if app doesn't intercept
          setTimeout(() => {
            window.location.href = 'https://www.instagram.com/';
          }, 1800);
        }, 500);
      }
    } catch (err) {
      console.error('Instagram share error:', err);
      setFeedbackMessage('Saved to photos! Open Instagram to share to your Story.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. WhatsApp Share: auto-saves high-res snapshot card & opens WhatsApp with formatted message + app store links
  const handleWhatsAppShare = async () => {
    // Save image to downloads so user can easily attach it to their chat
    await handleSaveImage(true);
    setFeedbackMessage('Image downloaded! Opening WhatsApp to share with caption...');
    const encodedText = encodeURIComponent(whatsAppShareMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // 5. Copy Text Caption / Link
  const handleCopyCaption = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(whatsAppShareMessage);
        setCopied(true);
        setFeedbackMessage('Full reflection & app links copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Copy failed:', err);
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
        background: '#0a0f1d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(10px, 2vh, 20px) clamp(12px, 3vw, 20px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        isolation: 'isolate'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          margin: 'auto 0'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 4px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="#38bdf8" />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.85)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Shareable Snapshot
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Snapshot"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              minWidth: '28px',
              maxWidth: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              flexShrink: 0,
              padding: 0,
              transition: 'background 0.2s ease'
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* The Single 9:16 Snapshot Card Preview */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <ShareableEmotionalSnapshotCard
            ref={cardRef}
            emotion={emotion}
            family={family}
            intensity={intensity}
            selectedContexts={selectedContexts}
            selectedNeeds={selectedNeeds}
          />
        </div>

        {/* Feedback Banner */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
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

        {/* Action Controls based on Platform View */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isMobile ? (
            /* PHONE VIEW ACTIONS */
            <>
              <motion.button
                type="button"
                onClick={handleInstagramStoryShare}
                disabled={isGenerating}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
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
                  boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.45)'
                }}
              >
                <Share2 size={16} />
                <span>{isGenerating ? 'Opening Instagram...' : 'Share to Instagram Story'}</span>
              </motion.button>

              <button
                type="button"
                onClick={() => handleSaveImage(false)}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 16px',
                  color: 'rgba(255, 255, 255, 0.85)',
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
                <span>Save Image</span>
              </button>
            </>
          ) : (
            /* DESKTOP / WEB VIEW ACTIONS */
            <>
              {/* Primary: Save Image */}
              <motion.button
                type="button"
                onClick={() => handleSaveImage(false)}
                disabled={isGenerating}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
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
                  boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.45)'
                }}
              >
                <Download size={16} />
                <span>{isGenerating ? 'Generating image...' : 'Save Image'}</span>
              </motion.button>

              {/* Secondary Actions: WhatsApp Share + Copy Caption */}
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  style={{
                    flex: 1,
                    background: 'rgba(37, 211, 102, 0.14)',
                    border: '1px solid rgba(37, 211, 102, 0.35)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    color: '#4ade80',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <MessageCircle size={14} />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  {copied ? <Check size={14} color="#38bdf8" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

