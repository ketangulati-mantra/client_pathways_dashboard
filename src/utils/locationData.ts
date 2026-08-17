// Standard list of world countries with flag emoji, name, dial code, and ISO 2-letter code
export interface Country {
  name: string;
  code: string; // ISO 2-letter
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: '🇭🇰' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: '🇹🇼' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
];

// Curated list of major global cities with country codes
export interface GlobalCity {
  name: string;
  country: string;
  countryCode: string;
}

export const GLOBAL_CITIES: GlobalCity[] = [
  // India
  { name: 'Delhi', country: 'India', countryCode: 'IN' },
  { name: 'Mumbai', country: 'India', countryCode: 'IN' },
  { name: 'Bengaluru', country: 'India', countryCode: 'IN' },
  { name: 'Hyderabad', country: 'India', countryCode: 'IN' },
  { name: 'Chennai', country: 'India', countryCode: 'IN' },
  { name: 'Kolkata', country: 'India', countryCode: 'IN' },
  { name: 'Pune', country: 'India', countryCode: 'IN' },
  { name: 'Ahmedabad', country: 'India', countryCode: 'IN' },
  { name: 'Jaipur', country: 'India', countryCode: 'IN' },
  { name: 'Chandigarh', country: 'India', countryCode: 'IN' },
  { name: 'Lucknow', country: 'India', countryCode: 'IN' },
  { name: 'Kochi', country: 'India', countryCode: 'IN' },
  // USA
  { name: 'New York', country: 'United States', countryCode: 'US' },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US' },
  { name: 'Chicago', country: 'United States', countryCode: 'US' },
  { name: 'Houston', country: 'United States', countryCode: 'US' },
  { name: 'Phoenix', country: 'United States', countryCode: 'US' },
  { name: 'San Francisco', country: 'United States', countryCode: 'US' },
  { name: 'Seattle', country: 'United States', countryCode: 'US' },
  { name: 'Boston', country: 'United States', countryCode: 'US' },
  { name: 'Miami', country: 'United States', countryCode: 'US' },
  { name: 'Dallas', country: 'United States', countryCode: 'US' },
  // UK
  { name: 'London', country: 'United Kingdom', countryCode: 'GB' },
  { name: 'Manchester', country: 'United Kingdom', countryCode: 'GB' },
  { name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB' },
  { name: 'Edinburgh', country: 'United Kingdom', countryCode: 'GB' },
  { name: 'Glasgow', country: 'United Kingdom', countryCode: 'GB' },
  // Canada
  { name: 'Toronto', country: 'Canada', countryCode: 'CA' },
  { name: 'Vancouver', country: 'Canada', countryCode: 'CA' },
  { name: 'Montreal', country: 'Canada', countryCode: 'CA' },
  { name: 'Calgary', country: 'Canada', countryCode: 'CA' },
  // Australia
  { name: 'Sydney', country: 'Australia', countryCode: 'AU' },
  { name: 'Melbourne', country: 'Australia', countryCode: 'AU' },
  { name: 'Brisbane', country: 'Australia', countryCode: 'AU' },
  { name: 'Perth', country: 'Australia', countryCode: 'AU' },
  // UAE & Middle East
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE' },
  { name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA' },
  { name: 'Doha', country: 'Qatar', countryCode: 'QA' },
  // Singapore & Asia
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG' },
  { name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY' },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR' },
  { name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK' },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH' },
  // Europe
  { name: 'Berlin', country: 'Germany', countryCode: 'DE' },
  { name: 'Frankfurt', country: 'Germany', countryCode: 'DE' },
  { name: 'Paris', country: 'France', countryCode: 'FR' },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' },
  { name: 'Zurich', country: 'Switzerland', countryCode: 'CH' },
  { name: 'Dublin', country: 'Ireland', countryCode: 'IE' },
];

/**
 * IP-based Geo Location Fetcher with multi-source fallback
 */
export async function fetchUserCountryByIP(): Promise<Country> {
  // Source 1: GeoJS (Fastest, High Availability, No Rate-Limit, CORS Enabled)
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        const found = COUNTRIES.find(c => c.code === data.country_code);
        if (found) return found;
      }
    }
  } catch (err) {}

  // Source 2: DB-IP
  try {
    const res = await fetch('https://api.db-ip.com/v2/free/self');
    if (res.ok) {
      const data = await res.json();
      if (data && data.countryCode) {
        const found = COUNTRIES.find(c => c.code === data.countryCode);
        if (found) return found;
      }
    }
  } catch (err) {}

  // Source 3: IPWhois
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        const found = COUNTRIES.find(c => c.code === data.country_code);
        if (found) return found;
      }
    }
  } catch (err) {}

  // Source 4: Browser Timezone Heuristic
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) {
      const us = COUNTRIES.find(c => c.code === 'US');
      if (us) return us;
    }
    if (tz.includes('London')) {
      const gb = COUNTRIES.find(c => c.code === 'GB');
      if (gb) return gb;
    }
    if (tz.includes('Kolkata') || tz.includes('India')) {
      const inC = COUNTRIES.find(c => c.code === 'IN');
      if (inC) return inC;
    }
  } catch (err) {}

  return COUNTRIES[0];
}

/**
 * Search global cities via API with fallback
 */
export async function searchGlobalCities(query: string): Promise<GlobalCity[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return GLOBAL_CITIES;

  try {
    const res = await fetch(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      const results = data._embedded?.['city:search-results'] || [];
      if (results.length > 0) {
        return results.map((item: any) => {
          const fullName = item.matching_full_name || '';
          const parts = fullName.split(',');
          const cityName = parts[0]?.trim() || clean;
          const countryName = parts[parts.length - 1]?.trim() || '';
          return { name: cityName, country: countryName, countryCode: '' };
        });
      }
    }
  } catch (e) {
    console.warn('[LocationData] Teleport API city search warning:', e);
  }

  // Fallback to local filtering
  return GLOBAL_CITIES.filter(c =>
    c.name.toLowerCase().includes(clean) || c.country.toLowerCase().includes(clean)
  );
}

/**
 * Validation utilities for email and phone number
 */
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const clean = email.trim();
  if (!clean) return { isValid: false, message: 'Email address is required' };
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(clean)) return { isValid: false, message: 'Please enter a valid email address (e.g. name@example.com)' };
  return { isValid: true };
}

export function validatePhone(phone: string): { isValid: boolean; message?: string } {
  const clean = phone.trim().replace(/[\s\-\(\)]/g, '');
  if (!clean) return { isValid: false, message: 'Phone number is required' };
  if (!/^\+?[0-9]{7,15}$/.test(clean)) {
    return { isValid: false, message: 'Please enter a valid phone number (7–15 digits)' };
  }
  return { isValid: true };
}
