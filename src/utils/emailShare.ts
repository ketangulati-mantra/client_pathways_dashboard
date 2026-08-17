/**
 * Email Sharing Utility (emailShare.ts)
 * 
 * Provides robust, cross-browser, pure client-side mailto draft generation.
 * Encodes all parameters with encodeURIComponent and uses \r\n line breaks for maximum client compatibility.
 */

export interface EmailDraftOptions {
  subject?: string;
  body?: string;
  providerName?: string;
  specialization?: string;
  profileUrl?: string;
  brandName?: string;
}

/**
 * Builds a clean, fully encoded mailto URL
 */
export function buildMailtoUrl(options: EmailDraftOptions): string {
  const {
    brandName = 'TherapyMantra',
    providerName = '',
    specialization = '',
    profileUrl = '',
    subject,
    body
  } = options;

  // 1. Build default subject if omitted
  const defaultSubject = `Professional Consultation & Support – ${brandName}`;
  const finalSubject = subject && subject.trim() ? subject.trim() : defaultSubject;

  // 2. Build default formatted body if omitted
  const defaultBodyTemplate = [
    'Hi,',
    '',
    'I hope you are doing well.',
    '',
    `I am pleased to share that I am accepting online consultations through ${brandName}.`,
    '',
    specialization ? `I focus on supporting individuals with ${specialization}.` : `I offer structured professional consultations for client well-being.`,
    '',
    'You can view my profile and current availability here:',
    profileUrl,
    '',
    'If you or someone in your network is looking for guidance, feel free to reach out or schedule a session.',
    '',
    'Warm regards,',
    providerName
  ].join('\r\n');

  let rawBody = body && body.trim() ? body.trim() : defaultBodyTemplate;

  // Normalize line endings to \r\n
  rawBody = rawBody.replace(/\r?\n/g, '\r\n');

  // Perform interpolation if placeholders exist in body string
  if (providerName) {
    rawBody = rawBody.replaceAll('{{providerName}}', providerName).replaceAll('{{name}}', providerName);
  }
  if (specialization) {
    rawBody = rawBody.replaceAll('{{specialization}}', specialization);
  }
  if (profileUrl) {
    rawBody = rawBody.replaceAll('{{profileUrl}}', profileUrl);
  }
  if (brandName) {
    rawBody = rawBody.replaceAll('TherapyMantra', brandName);
  }

  // 3. Strict parameter encoding using encodeURIComponent
  const encodedSubject = encodeURIComponent(finalSubject);
  const encodedBody = encodeURIComponent(rawBody);

  const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

  if ((import.meta as any).env?.DEV) {
    console.log('[emailShare] Generated Mailto URL:', {
      length: mailtoUrl.length,
      finalSubject,
      rawBody,
      mailtoUrl
    });
  }

  return mailtoUrl;
}

export interface EmailShareResult {
  success: boolean;
  toastMessage: string;
}

/**
 * Open Gmail web compose using official view=cm&fs=1 query parameters to prefill Subject and Body
 */
export async function openGmailDraft(
  textToCopy: string,
  copyFn: (text: string) => Promise<boolean>,
  options?: EmailDraftOptions
): Promise<EmailShareResult> {
  // 1. Copy full text automatically to clipboard as fallback
  const copied = await copyFn(textToCopy);

  // 2. Parse Subject & Body from template text or options
  let subject = options?.subject || 'Mental Health Support';
  let bodyContent = textToCopy;

  if (textToCopy.startsWith('Subject:')) {
    const lines = textToCopy.split('\n');
    subject = lines[0].replace(/^Subject:\s*/i, '').trim();
    bodyContent = lines.slice(1).join('\n').trim();
  }

  // Normalize line endings to \r\n before encoding
  const normalizedBody = bodyContent.replace(/\r?\n/g, '\r\n');

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(normalizedBody);

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedSubject}&body=${encodedBody}`;

  if ((import.meta as any).env?.DEV) {
    console.log('[Gmail Compose URL]:', {
      subject,
      bodyLength: normalizedBody.length,
      url: gmailComposeUrl
    });
  }

  window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');

  return {
    success: copied,
    toastMessage: 'Gmail web draft opened with pre-filled content! (Also copied to clipboard)'
  };
}

/**
 * Open Outlook web mail compose with prefilled Subject and Body query parameters
 */
export async function openOutlookDraft(
  textToCopy: string,
  copyFn: (text: string) => Promise<boolean>,
  options?: EmailDraftOptions
): Promise<EmailShareResult> {
  const copied = await copyFn(textToCopy);

  let subject = options?.subject || 'Mental Health Support';
  let bodyContent = textToCopy;

  if (textToCopy.startsWith('Subject:')) {
    const lines = textToCopy.split('\n');
    subject = lines[0].replace(/^Subject:\s*/i, '').trim();
    bodyContent = lines.slice(1).join('\n').trim();
  }

  const normalizedBody = bodyContent.replace(/\r?\n/g, '\r\n');
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(normalizedBody);

  const outlookComposeUrl = `https://outlook.office.com/mail/deeplink/compose?subject=${encodedSubject}&body=${encodedBody}`;

  window.open(outlookComposeUrl, '_blank', 'noopener,noreferrer');

  return {
    success: copied,
    toastMessage: 'Outlook web draft opened! (Also copied to clipboard)'
  };
}

/**
 * Executes mailto draft opening for users with desktop clients (Outlook Desktop, Apple Mail, Thunderbird)
 */
export async function openDefaultMailApp(
  options: EmailDraftOptions,
  copyFn: (text: string) => Promise<boolean>
): Promise<EmailShareResult> {
  const mailtoUrl = buildMailtoUrl(options);
  const rawBodyText = options.body || buildMailtoUrl(options);

  // Copy automatically first
  await copyFn(rawBodyText);

  // Open mailto link without using window.location.href to avoid navigating current tab
  window.open(mailtoUrl, '_self');

  return {
    success: true,
    toastMessage: 'Default mail app opened. Email also copied to clipboard.'
  };
}
