import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

const LANGUAGE_ALIASES = {
  hindi: 'hi',
  french: 'fr',
  japanese: 'ja',
  german: 'de',
  spanish: 'es',
  chinese: 'zh-Hans',
  mandarin: 'zh-Hans',
  cantonese: 'zh-Hant',
  portuguese: 'pt',
  italian: 'it',
  russian: 'ru',
  turkish: 'tr',
  korean: 'ko',
  dutch: 'nl',
  polish: 'pl',
  indonesian: 'id',
  malay: 'ms',
  vietnamese: 'vi',
  thai: 'th',
  hebrew: 'he',
  urdu: 'ur',
  tamil: 'ta',
  telugu: 'te',
  bengali: 'bn',
  swedish: 'sv',
  norwegian: 'no',
  danish: 'da',
  finnish: 'fi',
  hungarian: 'hu',
  romanian: 'ro',
  czech: 'cs',
  greek: 'el',
  tagalog: 'tl',
  filipino: 'tl'
};

// Normalize language codes (e.g. 'en-US' -> 'en', 'es-ES' -> 'es', 'hindi' -> 'hi') while preserving 'zh-Hans' and 'zh-Hant'
const normalizeLanguage = (lng) => {
  if (!lng) return 'en';
  const clean = lng.trim().toLowerCase();
  if (LANGUAGE_ALIASES[clean]) return LANGUAGE_ALIASES[clean];
  if (clean === 'zh-tw' || clean === 'zh-hant') return 'zh-Hant';
  if (clean === 'zh-cn' || clean === 'zh-hans' || clean === 'zh') return 'zh-Hans';
  return clean.split('-')[0];
};

const hashQueryDetector = {
  name: 'hashQueryDetector',
  lookup() {
    if (typeof window === 'undefined') return undefined;
    const searchParams = new URLSearchParams(window.location.search);
    let lang = searchParams.get('lang');
    if (!lang && window.location.hash.includes('lang=')) {
      const qIdx = window.location.hash.indexOf('?');
      if (qIdx !== -1) {
        const hashParams = new URLSearchParams(window.location.hash.slice(qIdx));
        lang = hashParams.get('lang');
      }
    }
    return lang ? normalizeLanguage(lang) : undefined;
  },
  cacheUserLanguage() {}
};

const detector = new LanguageDetector();
detector.addDetector(hashQueryDetector);

i18n
  // Configure language detection to check querystring ?lang=xx and hash ?lang=xx
  .use(detector)
  // Enable dynamic imports for namespaces using Vite's dynamic import with automatic fallback
  .use(
    resourcesToBackend((language, namespace) => {
      const normLang = normalizeLanguage(language);
      return import(`./locales/${namespace}/${normLang}.json`).catch(() => {
        return import(`./locales/${namespace}/en.json`);
      });
    })
  )
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly',
    
    detection: {
      order: ['hashQueryDetector', 'querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
    },
    
    // Default namespace
    ns: ['shared'],
    defaultNS: 'shared',

    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },

    react: {
      useSuspense: false, // Prevent blank screen hangs if dynamic imports load asynchronously
    }
  });

const RTL_LANGUAGES = ['ar', 'he', 'ur'];

const updateDocumentDirection = (lng) => {
  if (typeof document !== 'undefined') {
    const langCode = (lng || 'en').split('-')[0];
    const isRtl = RTL_LANGUAGES.includes(lng) || RTL_LANGUAGES.includes(langCode);
    const dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
    document.body.setAttribute('dir', dir);
  }
};

i18n.on('languageChanged', updateDocumentDirection);

// Initial call
if (i18n.language) {
  updateDocumentDirection(i18n.language);
}

export default i18n;
