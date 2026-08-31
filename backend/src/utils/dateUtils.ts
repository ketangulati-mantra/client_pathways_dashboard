/**
 * Timezone & Calendar Date Utility
 */

/**
 * Returns normalized local date string in YYYY-MM-DD format for a given timezone.
 */
export function getLocalCalendarDate(date: Date = new Date(), timezone?: string): string {
  const safeTimezone = timezone && isValidTimezone(timezone) ? timezone : 'UTC';

  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: safeTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  } catch (e) {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Returns yesterday's local date string in YYYY-MM-DD format relative to today's local date.
 */
export function getPreviousDayDate(localDateStr: string): string {
  const parts = localDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Returns tomorrow's date string in YYYY-MM-DD format relative to given date.
 */
export function getNextDayDate(localDateStr: string): string {
  const parts = localDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Returns the difference in calendar days between two YYYY-MM-DD dates (date1 - date2).
 */
export function getCalendarDaysDiff(date1Str: string, date2Str: string): number {
  const parts1 = date1Str.split('-');
  const parts2 = date2Str.split('-');
  const y1 = parseInt(parts1[0], 10);
  const m1 = parseInt(parts1[1], 10);
  const d1 = parseInt(parts1[2], 10);
  const y2 = parseInt(parts2[0], 10);
  const m2 = parseInt(parts2[1], 10);
  const d2 = parseInt(parts2[2], 10);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc1 - utc2) / msPerDay);
}

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (e) {
    return false;
  }
}
