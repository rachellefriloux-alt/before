/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Date and time utility functions.
 * Got it, love.
 */

/**
 * Format time in 12-hour format with AM/PM
 * @param hour Hour in 24-hour format (0-23)
 * @param minute Minute (0-59)
 * @returns Formatted time string (e.g., "3:30 PM")
 */
export function formatTime(hour: number, minute: number = 0): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Format date in locale-specific format
 * @param date Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time
 * @param date Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${formatTime(date.getHours(), date.getMinutes())}`;
}

/**
 * Get relative time description
 * @param timestamp Unix timestamp in milliseconds
 * @returns String describing relative time (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTimeString(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}

/**
 * Get days between two dates
 * @param startDate Start date
 * @param endDate End date (defaults to current date)
 * @returns Number of days between dates
 */
export function getDaysBetween(startDate: Date, endDate: Date = new Date()): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
  return diffDays;
}

/**
 * Get the start of day for a given date
 * @param date Date object
 * @returns Date object set to the start of the day (00:00:00.000)
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of day for a given date
 * @param date Date object
 * @returns Date object set to the end of the day (23:59:59.999)
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if a date is today
 * @param date Date object
 * @returns boolean
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get a date object for a specific hour today
 * @param hour Hour in 24-hour format (0-23)
 * @returns Date object
 */
export function getDateForHourToday(hour: number): Date {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date;
}

/**
 * Convert 12-hour time to 24-hour format
 * @param hour Hour (1-12)
 * @param minute Minute (0-59)
 * @param isPM Whether it's PM
 * @returns Hour in 24-hour format (0-23)
 */
export function convertTo24Hour(hour: number, minute: number, isPM: boolean): number {
  if (hour === 12) {
    return isPM ? 12 : 0;
  }
  return isPM ? hour + 12 : hour;
}
