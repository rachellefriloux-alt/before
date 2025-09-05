/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced date formatting and manipulation utilities.
 * Got it, love.
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import duration from 'dayjs/plugin/duration';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isToday from 'dayjs/plugin/isToday';
import isBetween from 'dayjs/plugin/isBetween';

// Initialize plugins
dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(duration);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.extend(isBetween);

/**
 * Format a date with standard formatting options
 * @param date The date to format
 * @param format The format string to use (defaults to 'MMM D, YYYY')
 */
export function formatDate(date: Date | number | string, format: string = 'MMM D, YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Format a date in a relative way (e.g., "2 hours ago", "in 3 days")
 * @param date The date to format
 * @param baseDate Optional reference date for comparison (defaults to now)
 */
export function formatRelative(date: Date | number | string, baseDate?: Date | number | string): string {
  return baseDate ? dayjs(date).from(dayjs(baseDate)) : dayjs(date).fromNow();
}

/**
 * Format a date in a calendar format (e.g., "Today", "Yesterday", "Last Monday")
 * @param date The date to format
 */
export function formatCalendar(date: Date | number | string): string {
  return dayjs(date).calendar();
}

/**
 * Check if a date is today
 * @param date The date to check
 */
export function isDateToday(date: Date | number | string): boolean {
  return dayjs(date).isToday();
}

/**
 * Get the week number of a date
 * @param date The date to get the week number for
 */
export function getWeekNumber(date: Date | number | string): number {
  return dayjs(date).week();
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param milliseconds The duration in milliseconds
 * @param format The format to display (defaults to 'HH:mm:ss')
 */
export function formatDuration(milliseconds: number, format: string = 'HH:mm:ss'): string {
  return dayjs.duration(milliseconds).format(format);
}

/**
 * Get the difference between two dates in the specified unit
 * @param date1 The first date
 * @param date2 The second date
 * @param unit The unit to measure the difference in (defaults to 'milliseconds')
 */
export function getDateDifference(
  date1: Date | number | string,
  date2: Date | number | string,
  unit: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' = 'millisecond'
): number {
  return dayjs(date1).diff(dayjs(date2), unit);
}

/**
 * Check if a date is within a specified range
 * @param date The date to check
 * @param startDate The start of the range
 * @param endDate The end of the range
 * @param inclusivity Include start/end dates ('()', '(]', '[)', '[]')
 */
export function isDateInRange(
  date: Date | number | string,
  startDate: Date | number | string,
  endDate: Date | number | string,
  inclusivity: '()' | '(]' | '[)' | '[]' = '[]'
): boolean {
  return dayjs(date).isBetween(dayjs(startDate), dayjs(endDate), null, inclusivity);
}

/**
 * Add a specified amount of time to a date
 * @param date The base date
 * @param amount The amount to add
 * @param unit The unit of time
 */
export function addTime(
  date: Date | number | string,
  amount: number,
  unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
): Date {
  return dayjs(date).add(amount, unit).toDate();
}

/**
 * Format a date with smart relative or absolute formatting based on how recent it is
 * @param date The date to format
 */
export function formatSmartDate(date: Date | number | string): string {
  const dayjsDate = dayjs(date);
  const now = dayjs();
  
  if (dayjsDate.isToday()) {
    // Today, use time format
    return dayjsDate.format('h:mm A');
  } else if (dayjsDate.isSame(now.subtract(1, 'day'), 'day')) {
    // Yesterday
    return 'Yesterday';
  } else if (dayjsDate.isSame(now, 'week')) {
    // This week, use day name
    return dayjsDate.format('dddd');
  } else if (dayjsDate.isSame(now, 'year')) {
    // This year, use month and day
    return dayjsDate.format('MMM D');
  } else {
    // Different year, include year
    return dayjsDate.format('MMM D, YYYY');
  }
}

/**
 * Format a date in a way that's friendly for humans, with additional Salle-style flair
 * @param date The date to format
 */
export function formatSalleDate(date: Date | number | string): string {
  const dayjsDate = dayjs(date);
  const now = dayjs();
  const diffMinutes = now.diff(dayjsDate, 'minute');
  
  // Just now (within 2 minutes)
  if (diffMinutes < 2) {
    return 'Just now, love';
  }
  
  // Recent time (within an hour)
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Today
  if (dayjsDate.isToday()) {
    return `Today at ${dayjsDate.format('h:mm A')}`;
  }
  
  // Yesterday
  if (dayjsDate.isSame(now.subtract(1, 'day'), 'day')) {
    return `Yesterday at ${dayjsDate.format('h:mm A')}`;
  }
  
  // Within the last week
  if (now.diff(dayjsDate, 'day') < 7) {
    return `${dayjsDate.format('dddd')} at ${dayjsDate.format('h:mm A')}`;
  }
  
  // Within the current year
  if (dayjsDate.isSame(now, 'year')) {
    return dayjsDate.format('MMM D');
  }
  
  // Default format for older dates
  return dayjsDate.format('MMM D, YYYY');
}
