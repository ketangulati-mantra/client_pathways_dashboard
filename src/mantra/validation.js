import { isValidPhoneNumber as libphonenumberIsValid } from 'libphonenumber-js';

export const isValidEmail = (email) => {
  if (!email) return false;
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;
  // Standard email validation regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(trimmed);
};

export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (trimmed.length === 0) return false;
  
  try {
    // If a country selector is not present, we rely on the user providing 
    // the country code with a '+'. libphonenumber-js natively handles '+' prefixes.
    // We pass undefined as the default country to enforce international parsing.
    return libphonenumberIsValid(trimmed);
  } catch (error) {
    return false;
  }
};
