/// <reference types="vite/client" />

/**
 * Mantra Care Platform Configuration
 */
let cachedSubpathPrefix: string | null = null;

const getDynamicApiBase = () => {
  if (typeof window === 'undefined') return '';
  
  const metaEnv = (import.meta as any).env;
  if (metaEnv?.VITE_BACKEND_URL) {
    return metaEnv.VITE_BACKEND_URL.replace(/\/api\/?$/, '');
  }

  const hostname = window.location.hostname;
  const port = window.location.port;
  const isLocalDev = (hostname === 'localhost' || hostname === '127.0.0.1') && (port === '5173' || port === '3000');

  if (isLocalDev) {
    return 'http://localhost:5000';
  }

  if (cachedSubpathPrefix !== null) {
    return cachedSubpathPrefix;
  }

  try {
    const stored = sessionStorage.getItem('mantra_subpath_prefix');
    if (stored) {
      cachedSubpathPrefix = stored;
      return stored;
    }
  } catch (e) {}

  const p = window.location.pathname;
  const knownPrefixes = [
    '/provider_pathways_dashboard_v3',
    '/provider_pathways_dashboard_v2',
    '/provider_dashboard_v1',
    '/provider_pathways_dashboard_v1',
    '/provider_pathways_v2_testing',
    '/provider_pathways',
    '/provider_pathway',
    '/provider_activity'
  ];

  let prefix = '';
  for (const known of knownPrefixes) {
    if (p.startsWith(known)) {
      prefix = known;
      break;
    }
  }

  try {
    sessionStorage.setItem('mantra_subpath_prefix', prefix);
  } catch (e) {}

  cachedSubpathPrefix = prefix;
  return prefix;
};

export const MANTRA_CONFIG = {
  get apiBaseUrl() {
    return getDynamicApiBase();
  },

  dashboardUrl: 'https://provider.mantracare.com/pathway',

  webhookUrl: 'https://api.mantracare.com/webhook/pathway',

  /**
   * Default webhook intent.
   * Supported values:
   * - complete_activity
   * - assign_activity
   * - assign_pathway
   * - assign_and_complete_activity
   */
  defaultWebhookIntent: 'complete_activity',

  redirectAfterCompletion: false,

  devMode: true
} as const;