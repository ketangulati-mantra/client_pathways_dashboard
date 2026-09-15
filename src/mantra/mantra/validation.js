import { isValidPhoneNumber as libphonenumberIsValid } from 'libphonenumber-js';

// Common temporary / disposable email domain blacklist
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'trashmail.com',
  'dispostable.com', 'yopmail.com', 'guerrillamail.com', 'fakeinbox.com',
  'getairmail.com', 'sharklasers.com', 'throwawaymail.com', 'tempmail.net',
  'byom.de', 'maildrop.cc', 'inboxalias.com'
];

export const isValidEmail = (email) => {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 5) return false;

  // Strict RFC-compliant email regex
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(trimmed)) return false;

  const domain = trimmed.split('@')[1];
  if (!domain || DISPOSABLE_EMAIL_DOMAINS.includes(domain)) return false;

  return true;
};

export const isValidPhoneNumber = (phone, countryCode = '') => {
  if (!phone) return false;
  const trimmed = phone.trim();
  const rawDigits = trimmed.replace(/[^\d]/g, '');

  if (rawDigits.length === 0) return false;

  // Reject repetitive or sequential fake numbers like 0000000000, 1234567890, 9999999999
  if (/^(\d)\1+$|^1234567890$|^0123456789$/.test(rawDigits)) {
    return false;
  }

  // Length check according to ITU E.164 standard (7 to 15 digits)
  if (rawDigits.length < 7 || rawDigits.length > 15) {
    return false;
  }

  const fullNumber = countryCode 
    ? `${countryCode.startsWith('+') ? countryCode : '+' + countryCode}${rawDigits}`
    : (trimmed.startsWith('+') ? trimmed : `+${rawDigits}`);

  try {
    return libphonenumberIsValid(fullNumber);
  } catch (error) {
    return rawDigits.length >= 8 && rawDigits.length <= 13;
  }
};
