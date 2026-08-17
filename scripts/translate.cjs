const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('crypto'); // Built-in crypto in Node 20 doesn't have v4 directly without import, actually it does in `crypto.randomUUID()`. Let's just use crypto.randomUUID().

// Safely load .env
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*(AZURE_TRANSLATOR_[A-Z_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
} catch (e) {
  console.log("No .env file found or failed to read. Assuming env vars are injected.");
}

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION;
const ENDPOINT = "https://api.cognitive.microsofttranslator.com";

let USE_MOCK = false;
if (!AZURE_KEY) {
  console.warn("⚠️ Missing AZURE_TRANSLATOR_KEY in .env. Falling back to MOCK translations for demonstration.");
  USE_MOCK = true;
}

const SUPPORTED_LANGUAGES = [
  'es', 'fr', 'de', 'pt', 'ru', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'ar', 'hi', 'bn',
  'id', 'tr', 'vi', 'it', 'pl', 'th', 'tl', 'nl', 'sv', 'no', 'da', 'fi', 'cs', 'el',
  'ro', 'hu', 'uk', 'he', 'ms', 'ta', 'te', 'ur'
];

async function translateText(texts, targetLang) {
  if (texts.length === 0) return [];

  if (USE_MOCK) {
    return texts.map(t => `[${targetLang}] ${t}`);
  }

  const map = {
    'tl': 'fil',
    'no': 'nb'
  };
  const azureLang = map[targetLang] || targetLang;

  const url = `${ENDPOINT}/translate?api-version=3.0&from=en&to=${azureLang}`;
  
  try {
    const response = await axios({
      baseURL: url,
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
        'Ocp-Apim-Subscription-Region': AZURE_REGION,
        'Content-type': 'application/json',
        'X-ClientTraceId': require('crypto').randomUUID().toString()
      },
      data: texts.map(t => ({ text: t })),
      responseType: 'json'
    });
    return response.data.map(d => d.translations[0].text);
  } catch (error) {
    console.error(`Azure Translation API Error for ${targetLang}:`, JSON.stringify(error.response?.data, null, 2) || error.message);
    throw error;
  }
}

// Helper to flatten nested JSON safely
function flattenObj(obj, prefix = '') {
  let result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObj(value, prefix + key + '.'));
    } else {
      result[prefix + key] = value;
    }
  }
  return result;
}

// Helper to unflatten JSON
function unflattenObj(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    keys.reduce((acc, currentKey, index) => {
      if (index === keys.length - 1) {
        acc[currentKey] = value;
      } else {
        acc[currentKey] = acc[currentKey] || {};
      }
      return acc[currentKey];
    }, result);
  }
  return result;
}

async function run() {
  const moduleName = process.argv[2];
  if (!moduleName) {
    console.error("Usage: node translate.js <module-name>");
    process.exit(1);
  }

  const localeDir = path.join(__dirname, `../src/locales/${moduleName}`);
  const enFile = path.join(localeDir, 'en.json');

  if (!fs.existsSync(enFile)) {
    console.error(`Missing English source file: ${enFile}`);
    process.exit(1);
  }

  const enData = flattenObj(JSON.parse(fs.readFileSync(enFile, 'utf8')));
  const enKeys = Object.keys(enData);

  console.log(`Extracting module '${moduleName}'. Found ${enKeys.length} keys in English.`);

    // Process target languages in parallel batches of 5
    const CONCURRENCY = 5;
    for (let lIndex = 0; lIndex < SUPPORTED_LANGUAGES.length; lIndex += CONCURRENCY) {
      const langBatch = SUPPORTED_LANGUAGES.slice(lIndex, lIndex + CONCURRENCY);
      await Promise.all(langBatch.map(async (lang) => {
        const langFile = path.join(localeDir, `${lang}.json`);
        let langData = {};
        if (fs.existsSync(langFile)) {
          langData = flattenObj(JSON.parse(fs.readFileSync(langFile, 'utf8')));
        }

        const missingKeys = enKeys.filter(k => !langData[k]);
        if (missingKeys.length === 0) {
          console.log(`[${lang}] Up to date.`);
          return;
        }

        console.log(`[${lang}] Translating ${missingKeys.length} missing keys...`);
        const textsToTranslate = missingKeys.map(k => enData[k]);
        const BATCH_SIZE = 100;
        const translatedTexts = [];

        for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
          const batch = textsToTranslate.slice(i, i + BATCH_SIZE);
          const results = await translateText(batch, lang);
          translatedTexts.push(...results);
          await new Promise(r => setTimeout(r, 50));
        }

        missingKeys.forEach((key, index) => {
          langData[key] = translatedTexts[index];
        });

        const finalJson = unflattenObj(langData);
        fs.writeFileSync(langFile, JSON.stringify(finalJson, null, 2));
        console.log(`[${lang}] Saved ${langFile}`);
      }));
    }

  console.log("Translation complete!");
}

run().catch(console.error);
