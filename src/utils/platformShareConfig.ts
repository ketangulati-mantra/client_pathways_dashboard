/**
 * Platform Share Configuration & Utility Functions
 * 
 * Centralized, production-ready platform sharing strategies and helper utilities.
 * Complies strictly with official platform sharing capabilities (no unofficial hacks).
 */

export type ShareStrategyType = 'copy_and_open' | 'prefilled_intent' | 'mailto';

export interface PlatformShareConfig {
  id: string;
  name: string;
  buttonLabel: string;
  iconName: string;
  color: string;
  strategy: ShareStrategyType;
  baseUrl: string;
  supportsPrefill: boolean;
  toastMessage: string;
  noteMessage?: string;
}

export const PLATFORM_SHARE_CONFIGS: Record<string, PlatformShareConfig> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    buttonLabel: '📋 Copy & Open LinkedIn',
    iconName: 'Share2',
    color: '#0a66c2',
    strategy: 'copy_and_open',
    baseUrl: 'https://www.linkedin.com/feed/',
    supportsPrefill: false,
    toastMessage: 'Your LinkedIn post has been copied. Simply paste it into the post editor.',
    noteMessage: 'LinkedIn does not pre-fill text. Paste content into your post after window opens.'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    buttonLabel: '📋 Copy Caption & Open Instagram',
    iconName: 'Globe',
    color: '#c026d3',
    strategy: 'copy_and_open',
    baseUrl: 'https://www.instagram.com/',
    supportsPrefill: false,
    toastMessage: 'Caption copied. Paste it while publishing your Reel or Post.',
    noteMessage: 'Instagram requires manual paste when creating a post or reel.'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    buttonLabel: '📋 Copy & Open Facebook',
    iconName: 'Share2',
    color: '#2563eb',
    strategy: 'copy_and_open',
    baseUrl: 'https://www.facebook.com/',
    supportsPrefill: false,
    toastMessage: 'Post copied successfully.',
    noteMessage: 'Facebook policy requires manual paste in post box.'
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    buttonLabel: '✏ Post on X',
    iconName: 'FileText',
    color: '#0284c7',
    strategy: 'prefilled_intent',
    baseUrl: 'https://twitter.com/intent/tweet?text=',
    supportsPrefill: true,
    toastMessage: 'Tweet prepared with pre-filled content!'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    buttonLabel: '💬 Share on WhatsApp',
    iconName: 'MessageSquare',
    color: '#16a34a',
    strategy: 'prefilled_intent',
    baseUrl: 'https://api.whatsapp.com/send?text=',
    supportsPrefill: true,
    toastMessage: 'WhatsApp message ready with pre-filled text!'
  },
  email: {
    id: 'email',
    name: 'Email Signature',
    buttonLabel: '✉ Open Email Draft',
    iconName: 'Mail',
    color: '#4f46e5',
    strategy: 'mailto',
    baseUrl: 'mailto:',
    supportsPrefill: true,
    toastMessage: 'Email draft opened in your email client!'
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    buttonLabel: '📋 Copy & Open Reddit',
    iconName: 'MessageSquare',
    color: '#ea580c',
    strategy: 'copy_and_open',
    baseUrl: 'https://www.reddit.com/',
    supportsPrefill: false,
    toastMessage: 'Answer copied. Paste it into a relevant discussion.'
  },
  quora: {
    id: 'quora',
    name: 'Quora',
    buttonLabel: '📋 Copy & Open Quora',
    iconName: 'HelpCircle',
    color: '#b91c1c',
    strategy: 'copy_and_open',
    baseUrl: 'https://www.quora.com/',
    supportsPrefill: false,
    toastMessage: 'Answer copied. Paste it into your answer.'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    buttonLabel: '📋 Copy & Open YouTube Studio',
    iconName: 'Video',
    color: '#dc2626',
    strategy: 'copy_and_open',
    baseUrl: 'https://studio.youtube.com/',
    supportsPrefill: false,
    toastMessage: 'Video script copied. Paste it into YouTube Studio description.'
  }
};

/**
 * Robust, cross-browser clipboard copy with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('[Clipboard] Native API error, trying execCommand fallback:', err);
  }

  // Legacy fallback for older browsers / permission edge cases
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[Clipboard] Fallback copy failed:', err);
    return false;
  }
}

/**
 * Safely open external URL in a new tab without ever navigating the current window
 */
export function safeOpenUrl(url: string): void {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Utility Functions for Platform Actions */

export async function openLinkedIn(textToCopy?: string): Promise<boolean> {
  let copied = true;
  if (textToCopy) {
    copied = await copyToClipboard(textToCopy);
  }
  safeOpenUrl(PLATFORM_SHARE_CONFIGS.linkedin.baseUrl);
  return copied;
}

export async function openInstagram(textToCopy?: string): Promise<boolean> {
  let copied = true;
  if (textToCopy) {
    copied = await copyToClipboard(textToCopy);
  }
  safeOpenUrl(PLATFORM_SHARE_CONFIGS.instagram.baseUrl);
  return copied;
}

export async function openFacebook(textToCopy?: string): Promise<boolean> {
  let copied = true;
  if (textToCopy) {
    copied = await copyToClipboard(textToCopy);
  }
  safeOpenUrl(PLATFORM_SHARE_CONFIGS.facebook.baseUrl);
  return copied;
}

export function openTwitterIntent(text: string): void {
  const encodedText = encodeURIComponent(text || '');
  const url = `${PLATFORM_SHARE_CONFIGS.twitter.baseUrl}${encodedText}`;
  safeOpenUrl(url);
}

export function openWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text || '');
  const url = `${PLATFORM_SHARE_CONFIGS.whatsapp.baseUrl}${encodedText}`;
  safeOpenUrl(url);
}

import { openGmailDraft, openOutlookDraft, openDefaultMailApp, EmailDraftOptions } from './emailShare';

export async function openReddit(textToCopy?: string): Promise<boolean> {
  let copied = true;
  if (textToCopy) {
    copied = await copyToClipboard(textToCopy);
  }
  safeOpenUrl(PLATFORM_SHARE_CONFIGS.reddit.baseUrl);
  return copied;
}

export async function openQuora(textToCopy?: string): Promise<boolean> {
  let copied = true;
  if (textToCopy) {
    copied = await copyToClipboard(textToCopy);
  }
  safeOpenUrl(PLATFORM_SHARE_CONFIGS.quora.baseUrl);
  return copied;
}

export async function openYouTubeStudio(textToCopy?: string): Promise<boolean> {
  let copied = true;
  if (textToCopy) {
    copied = await copyToClipboard(textToCopy);
  }
  safeOpenUrl(PLATFORM_SHARE_CONFIGS.youtube.baseUrl);
  return copied;
}

/**
 * Unified Share Handler based on platform configuration
 */
export async function executePlatformShare(
  platformId: string,
  content: string,
  metadata?: { subject?: string; providerName?: string; specialization?: string; profileUrl?: string; brandName?: string; emailClient?: 'gmail' | 'outlook' | 'default' }
): Promise<{ success: boolean; toastMessage: string }> {
  const config = PLATFORM_SHARE_CONFIGS[platformId];
  if (!config) {
    // Default fallback
    const copied = await copyToClipboard(content);
    return {
      success: copied,
      toastMessage: copied ? 'Content copied to clipboard!' : 'Could not copy content.'
    };
  }

  switch (config.strategy) {
    case 'prefilled_intent':
      if (platformId === 'twitter') {
        openTwitterIntent(content);
      } else if (platformId === 'whatsapp') {
        openWhatsApp(content);
      }
      return { success: true, toastMessage: config.toastMessage };

    case 'mailto': {
      const client = metadata?.emailClient || 'gmail';
      if (client === 'gmail') {
        return await openGmailDraft(content, copyToClipboard, metadata);
      } else if (client === 'outlook') {
        return await openOutlookDraft(content, copyToClipboard, metadata);
      } else {
        return await openDefaultMailApp({
          subject: metadata?.subject,
          body: content,
          providerName: metadata?.providerName,
          specialization: metadata?.specialization,
          profileUrl: metadata?.profileUrl,
          brandName: metadata?.brandName
        }, copyToClipboard);
      }
    }

    case 'copy_and_open':
    default: {
      const copied = await copyToClipboard(content);
      safeOpenUrl(config.baseUrl);
      return {
        success: copied,
        toastMessage: copied ? config.toastMessage : `Opened ${config.name} (Copy failed)`
      };
    }
  }
}
