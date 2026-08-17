/**
 * Platform-Aware Certificate Download Service
 *
 * Supports:
 * 1. Web Browsers:
 *    - Chrome
 *    - Safari
 *    - Firefox
 *    - Edge
 *    Uses native HTML5 <a download>.
 *
 * 2. React Native WebView:
 *    - Sends a DOWNLOAD_CERTIFICATE_NATIVE message
 *      to the React Native container.
 *
 * IMPORTANT:
 * The React Native application MUST have an onMessage handler
 * for DOWNLOAD_CERTIFICATE_NATIVE and must perform the actual
 * native file save/download.
 */

/**
 * Sanitize filename across Windows, macOS, Android and iOS.
 */
export const sanitizeFilename = (
  name,
  defaultExt = 'png'
) => {
  const fallback = `TherapyMantra_Certificate.${defaultExt}`;

  if (!name || typeof name !== 'string') {
    return fallback;
  }

  let cleanName = name
    .trim()
    .replace(/[^a-zA-Z0-9_\-.]/g, '_');

  if (!cleanName) {
    return fallback;
  }

  const lowerName = cleanName.toLowerCase();

  const supportedExtensions = [
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg'
  ];

  const hasExtension = supportedExtensions.some((ext) =>
    lowerName.endsWith(ext)
  );

  if (hasExtension) {
    return cleanName;
  }

  return `${cleanName}.${defaultExt}`;
};


/**
 * Detect MIME type from a data URL.
 */
const getMimeTypeFromDataUrl = (dataUrl) => {
  if (
    typeof dataUrl !== 'string' ||
    !dataUrl.startsWith('data:')
  ) {
    return null;
  }

  const match = dataUrl.match(/^data:([^;,]+)/i);

  return match ? match[1].toLowerCase() : null;
};


/**
 * Validate certificate payload.
 */
export const validateCertificatePayload = (payload) => {
  if (!payload) {
    return {
      valid: false,
      reason: 'Empty payload'
    };
  }

  if (typeof payload === 'string') {
    // PNG
    if (
      payload.startsWith('data:image/png')
    ) {
      return {
        valid: true,
        mimeType: 'image/png',
        extension: 'png',
        isImage: true
      };
    }

    // JPEG
    if (
      payload.startsWith('data:image/jpeg') ||
      payload.startsWith('data:image/jpg')
    ) {
      return {
        valid: true,
        mimeType: 'image/jpeg',
        extension: 'jpg',
        isImage: true
      };
    }

    // PDF data URL
    if (
      payload.startsWith('data:application/pdf')
    ) {
      return {
        valid: true,
        mimeType: 'application/pdf',
        extension: 'pdf',
        isPdf: true
      };
    }

    // Raw PDF
    if (payload.startsWith('%PDF-')) {
      return {
        valid: true,
        mimeType: 'application/pdf',
        extension: 'pdf',
        isPdf: true
      };
    }

    // Other data URLs
    if (payload.startsWith('data:')) {
      const mimeType = getMimeTypeFromDataUrl(payload);

      return {
        valid: true,
        mimeType: mimeType || 'application/octet-stream',
        extension: 'bin'
      };
    }
  }

  // URL / binary / other payload
  return {
    valid: true,
    mimeType: 'application/octet-stream',
    extension: 'bin'
  };
};


/**
 * Detect whether the page is running inside
 * a React Native WebView.
 */
const isReactNativeWebView = () => {
  return (
    typeof window !== 'undefined' &&
    typeof window.ReactNativeWebView !== 'undefined' &&
    typeof window.ReactNativeWebView.postMessage === 'function'
  );
};


/**
 * Safely extract authentication information.
 */
const getAuthData = () => {
  const authData = {
    token: '',
    service: '',
    uid: ''
  };

  try {
    if (typeof window === 'undefined') {
      return authData;
    }

    authData.token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      '';

    const params = new URLSearchParams(
      window.location.search || ''
    );

    authData.service =
      params.get('service') ||
      params.get('source') ||
      '';

    authData.uid =
      params.get('uid') ||
      params.get('upa_id') ||
      '';
  } catch (error) {
    // Ignore storage/access errors.
  }

  return authData;
};


/**
 * Main certificate download function.
 */
export const downloadCertificate = async ({
  url,
  dataUrl,
  fileName = 'TherapyMantra_Certificate.png',
  userName = '',
  certificateId = '',
  showToast
}) => {
  const targetPayload = dataUrl || url;

  // ---------------------------------------------------------
  // 1. VALIDATION
  // ---------------------------------------------------------

  const validation =
    validateCertificatePayload(targetPayload);

  if (!validation.valid) {
    console.error(
      '[CertificateDownloadService] Validation failed:',
      validation.reason
    );

    showToast?.(
      'Unable to download your certificate. Please try again.',
      'error'
    );

    return false;
  }

  // Determine correct extension.
  const defaultExt =
    validation.extension ||
    (validation.isPdf ? 'pdf' : 'png');

  const cleanFilename =
    sanitizeFilename(fileName, defaultExt);


  // ---------------------------------------------------------
  // 2. AUTH CONTEXT
  // ---------------------------------------------------------

  const authData = getAuthData();


  // ---------------------------------------------------------
  // 3. PLATFORM DETECTION
  // ---------------------------------------------------------

  const isRNWebView =
    isReactNativeWebView();


  // ---------------------------------------------------------
  // DEBUG LOGGING
  // ---------------------------------------------------------

  if (
    import.meta.env?.DEV ||
    process.env.NODE_ENV !== 'production'
  ) {
    console.log(
      '[CertificateDownloadService] Download Request:',
      {
        fileName: cleanFilename,
        certificateId,
        mimeType: validation.mimeType,
        isRNWebView,
        hasUrl: !!url,
        hasDataUrl: !!dataUrl,
        hasAuthToken: !!authData.token,
        payloadSize: targetPayload
          ? `${Math.round(
            targetPayload.length / 1024
          )} KB`
          : 'N/A'
      }
    );
  }


  // =========================================================
  // 4. REACT NATIVE WEBVIEW
  // =========================================================

  if (isRNWebView) {
    try {
      showToast?.(
        'Preparing your certificate…',
        'info'
      );

      /**
       * IMPORTANT:
       *
       * Prefer URL over Base64 whenever available.
       *
       * React Native should download the URL natively.
       *
       * If only dataUrl exists, React Native should
       * decode the Base64 and save it natively.
       */

      const nativeMessage = {
        type: 'DOWNLOAD_CERTIFICATE_NATIVE',

        action: 'download_certificate',

        fileType: validation.isPdf
          ? 'pdf'
          : validation.isImage
            ? validation.extension
            : 'png',

        mimeType: validation.mimeType,

        filename: cleanFilename,

        /**
         * Prefer URL.
         */
        url: url || null,

        /**
         * Fallback when URL is unavailable.
         */
        dataUrl: dataUrl || null,

        userName:
          typeof userName === 'string'
            ? userName.trim()
            : '',

        certificateId:
          certificateId || '',

        /**
         * Only include auth if actually required
         * by the native implementation.
         */
        auth: {
          token: authData.token || '',
          service: authData.service || '',
          uid: authData.uid || ''
        }
      };

      window.ReactNativeWebView.postMessage(
        JSON.stringify(nativeMessage)
      );

      /**
       * IMPORTANT:
       *
       * This means the request was successfully
       * handed to React Native.
       *
       * It does NOT guarantee that the file
       * has been saved yet.
       */
      return true;

    } catch (error) {
      console.error(
        '[CertificateDownloadService] Native bridge error:',
        error
      );

      showToast?.(
        'Unable to download your certificate. Please try again.',
        'error'
      );

      return false;
    }
  }


  // =========================================================
  // 5. WEB BROWSER DOWNLOAD
  // =========================================================

  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return false;
  }

  try {
    let downloadUrl = targetPayload;
    let createdBlobUrl = null;


    // -------------------------------------------------------
    // Convert Data URL → Blob URL
    // -------------------------------------------------------

    if (
      typeof targetPayload === 'string' &&
      targetPayload.startsWith('data:')
    ) {
      try {
        const response =
          await fetch(targetPayload);

        if (!response.ok) {
          throw new Error(
            `Failed to read certificate: ${response.status}`
          );
        }

        const blob =
          await response.blob();

        createdBlobUrl =
          URL.createObjectURL(blob);

        downloadUrl =
          createdBlobUrl;

      } catch (error) {
        console.warn(
          '[CertificateDownloadService] Blob conversion failed, falling back to data URL:',
          error
        );

        downloadUrl =
          targetPayload;
      }
    }


    // -------------------------------------------------------
    // Create download link
    // -------------------------------------------------------

    const link =
      document.createElement('a');

    link.href = downloadUrl;
    link.download = cleanFilename;

    /**
     * Don't use target="_blank".
     * It is unnecessary for downloads and can cause
     * unwanted behavior in some WebViews/browsers.
     */
    link.style.display = 'none';

    document.body.appendChild(link);

    link.click();


    // -------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------

    setTimeout(() => {
      try {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }

        if (createdBlobUrl) {
          URL.revokeObjectURL(createdBlobUrl);
        }
      } catch (error) {
        // Ignore cleanup errors.
      }
    }, 3000);


    showToast?.(
      'Certificate downloaded successfully.',
      'success'
    );

    return true;

  } catch (error) {
    console.error(
      '[CertificateDownloadService] Web download error:',
      error
    );

    showToast?.(
      'Unable to download your certificate. Please try again.',
      'error'
    );

    return false;
  }
};