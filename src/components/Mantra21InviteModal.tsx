import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Send,
  Sparkles,
  Edit3,
  ExternalLink,
  Users,
  Smartphone,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { getActiveUserId, getActiveUserName } from '../services/authService';
import {
  IOS_APP_URL,
  ANDROID_APP_URL,
  trackInviteEvent
} from '../config/mantra21ShareConfig';

interface Mantra21InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: (method: string) => void;
  challengeName?: string;
}

export default function Mantra21InviteModal({
  isOpen,
  onClose,
  onInviteSent
}: Mantra21InviteModalProps) {
  const userId = getActiveUserId();
  const userName = getActiveUserName() || 'A friend';

  // Default app download & challenge invite message
  const defaultBody = `I'm joining Mantra 21 — a 21-day mental health challenge built around small, practical steps.\n\nDownload the TherapyMantra app to join the challenge with me:\n\n📱 iOS / App Store:\n${IOS_APP_URL}\n\n🤖 Android / Google Play:\n${ANDROID_APP_URL}`;

  const [message, setMessage] = useState(defaultBody);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentState, setSentState] = useState<{ isSent: boolean; method: string }>({
    isSent: false,
    method: ''
  });

  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setSupportsNativeShare(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMessage(defaultBody);
      setIsEditing(false);
      setCopiedLink(false);
      setSentState({ isSent: false, method: '' });
      trackInviteEvent('invite_created', { userId, userName });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. WhatsApp Share
  const handleWhatsApp = () => {
    trackInviteEvent('invite_method', { method: 'whatsapp' });
    trackInviteEvent('invite_shared', { method: 'whatsapp' });
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    triggerSuccess('WhatsApp');
  };

  // 2. Email Share
  const handleEmail = () => {
    trackInviteEvent('invite_method', { method: 'email' });
    trackInviteEvent('invite_shared', { method: 'email' });
    const subject = encodeURIComponent('Want to join me for Mantra 21?');
    const emailBody = encodeURIComponent(
      `Hey,\n\nI'm joining Mantra 21 — a 21-day mental health challenge built around small, practical steps.\n\nDownload the TherapyMantra app to join the challenge with me:\n\n📱 iOS / App Store:\n${IOS_APP_URL}\n\n🤖 Android / Google Play:\n${ANDROID_APP_URL}\n\nSee you in there!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${emailBody}`;
    triggerSuccess('Email');
  };

  // 3. SMS / Messages Share
  const handleSMS = () => {
    trackInviteEvent('invite_method', { method: 'sms' });
    trackInviteEvent('invite_shared', { method: 'sms' });
    const smsText = encodeURIComponent(
      `I'm joining Mantra 21 — a 21-day mental health challenge! Download the app to join me:\n\nApp Store: ${IOS_APP_URL}\nGoogle Play: ${ANDROID_APP_URL}`
    );
    window.location.href = `sms:?&body=${smsText}`;
    triggerSuccess('Messages');
  };

  // 4. Telegram Share
  const handleTelegram = () => {
    trackInviteEvent('invite_method', { method: 'telegram' });
    trackInviteEvent('invite_shared', { method: 'telegram' });
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(ANDROID_APP_URL)}&text=${encodeURIComponent(
      `I'm joining Mantra 21 — a 21-day mental health challenge! Download the app to join:\nApp Store: ${IOS_APP_URL}\nGoogle Play: ${ANDROID_APP_URL}`
    )}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
    triggerSuccess('Telegram');
  };

  // 5. Copy Message / Links
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = message;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      trackInviteEvent('invite_link_copied', { links: { ios: IOS_APP_URL, android: ANDROID_APP_URL } });
      setTimeout(() => setCopiedLink(false), 2400);
      triggerSuccess('App Links Copied');
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  // 6. Native Share API (More)
  const handleNativeShare = async () => {
    trackInviteEvent('invite_method', { method: 'native_share' });
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me in Mantra 21',
          text: message
        });
        trackInviteEvent('invite_shared', { method: 'native_share' });
        triggerSuccess('Native Share');
      } catch (err) {
        // User cancelled or share aborted
      }
    } else {
      handleCopy();
    }
  };

  const triggerSuccess = (method: string) => {
    if (onInviteSent) onInviteSent(method);
    setSentState({ isSent: true, method });
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          backgroundColor: 'rgba(5, 7, 12, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '0'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            background: 'linear-gradient(180deg, #131726 0%, #090B12 100%)',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            border: '1px solid rgba(255, 87, 34, 0.25)',
            borderBottom: 'none',
            boxShadow: '0 -15px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 87, 34, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Top handle bar */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px' }}>
            <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '18px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          {/* Modal Content Scroll Area */}
          <div style={{ padding: '16px 22px 28px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 900,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={12} />
                <span>MANTRA 21</span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                Do it with someone.
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8', lineHeight: 1.4 }}>
                Some journeys are better with someone beside you.
              </p>
            </div>

            {/* Editable Invitation Message Preview Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px 16px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  INVITATION PREVIEW
                </span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FF7A45',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Edit3 size={12} />
                  <span>{isEditing ? 'Done editing' : 'Edit message'}</span>
                </button>
              </div>

              {isEditing ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 87, 34, 0.4)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#F8FAFC',
                    fontSize: '12.5px',
                    fontFamily: 'inherit',
                    lineHeight: 1.45,
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '12.5px',
                    color: '#CBD5E1',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line',
                    maxHeight: '140px',
                    overflowY: 'auto'
                  }}
                >
                  {message}
                </div>
              )}
            </div>

            {/* Share Methods Grid */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                SHARE VIA
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '8px'
                }}
              >
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsApp}
                  style={{
                    background: 'rgba(37, 211, 102, 0.1)',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(37, 211, 102, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#25D366',
                      flexShrink: 0
                    }}
                  >
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>WhatsApp</div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Pre-filled message</div>
                  </div>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopy}
                  style={{
                    background: copiedLink ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 87, 34, 0.1)',
                    border: `1px solid ${copiedLink ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 87, 34, 0.3)'}`,
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: copiedLink ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 87, 34, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: copiedLink ? '#4ADE80' : '#FF7A45',
                      flexShrink: 0
                    }}
                  >
                    {copiedLink ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: copiedLink ? '#4ADE80' : '#FFFFFF' }}>
                      {copiedLink ? '✓ Copied' : 'Copy invite'}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>App download links</div>
                  </div>
                </button>

                {/* Messages / SMS */}
                <button
                  onClick={handleSMS}
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38BDF8',
                      flexShrink: 0
                    }}
                  >
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>Messages</div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Native SMS composer</div>
                  </div>
                </button>

                {/* Email */}
                <button
                  onClick={handleEmail}
                  style={{
                    background: 'rgba(167, 139, 250, 0.08)',
                    border: '1px solid rgba(167, 139, 250, 0.25)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(167, 139, 250, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#A78BFA',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>Email</div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Default mail client</div>
                  </div>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleTelegram}
                  style={{
                    background: 'rgba(0, 136, 204, 0.08)',
                    border: '1px solid rgba(0, 136, 204, 0.25)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(0, 136, 204, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0088cc',
                      flexShrink: 0
                    }}
                  >
                    <Send size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>Telegram</div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Direct chat share</div>
                  </div>
                </button>

                {/* More / Web Share API */}
                <button
                  onClick={handleNativeShare}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F8FAFC',
                      flexShrink: 0
                    }}
                  >
                    <Share2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                      {supportsNativeShare ? 'More Options' : 'Share URL'}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Device share sheet</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Hook / Privacy Anchor */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <Users size={14} color="#FF7A45" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>
                  Doing it together can make showing up a little easier.
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4 }}>
                Your friend doesn't need to be on the same day as you. They start at their own pace with zero shared private data.
              </p>
            </div>

            {/* Post-Share Confirmation Banner */}
            {sentState.isSent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)',
                  border: '1px solid rgba(255, 87, 34, 0.4)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF' }}>
                    INVITE SENT ✦
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#CBD5E1' }}>
                    Now it's their turn to join you.
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    color: '#07080D',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  DONE
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
