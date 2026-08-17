/**
 * Platform-aware Certificate Download & External Browser Helper
 * 
 * WEB: Preserves working web browser download functionality (<a download>).
 * REACT NATIVE: Sends action to native mobile wrapper to open certificate in external browser via Linking.openURL.
 */
export const openCertificate = async (certificateUrl, filename, options = {}) => {
  const { showToast } = options;

  if (!certificateUrl) {
    if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
      console.error('[CertificateDownload] Error: Missing certificate URL.');
    }
    if (showToast) {
      showToast('Unable to open certificate. Please try again.', 'error');
    }
    return false;
  }

  const isRNWebView = typeof window !== 'undefined' && !!window.ReactNativeWebView;

  // React Native Mobile Execution Path
  if (isRNWebView) {
    try {
      if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
        console.log('[CertificateDownload] React Native Detected. Dispatching open_url:', {
          url: certificateUrl,
          filename
        });
      }

      if (showToast) {
        showToast('Opening certificate in your browser…', 'info');
      }

      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: 'open_url',
        type: 'OPEN_EXTERNAL_URL',
        url: certificateUrl,
        filename: filename || 'certificate.pdf'
      }));

      return true;
    } catch (err) {
      if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
        console.error('[CertificateDownload] React Native postMessage Error:', err);
      }
      if (showToast) {
        showToast('Unable to open the certificate. Please try again.', 'error');
      }
      return false;
    }
  }

  // Web Browser Execution Path (Preserves exact working web download)
  if (typeof document !== 'undefined') {
    try {
      if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
        console.log('[CertificateDownload] Web Browser Detected. Executing anchor download:', {
          filename
        });
      }

      const link = document.createElement('a');
      link.href = certificateUrl;
      if (filename) {
        link.download = filename;
      }
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        try {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        } catch (e) {}
      }, 2000);

      if (showToast) {
        showToast('Certificate downloaded successfully!', 'success');
      }
      return true;
    } catch (err) {
      if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
        console.error('[CertificateDownload] Web Download Error:', err);
      }
      if (showToast) {
        showToast('Unable to download certificate. Please try again.', 'error');
      }
      return false;
    }
  }

  return false;
};
