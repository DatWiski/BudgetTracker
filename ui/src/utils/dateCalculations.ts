// Date calculation utilities for subscriptions

/**
 * Calculates the previous billing date based on the next billing date and billing period
 * Handles month/year boundaries properly
 */
import type { Period } from "../types";

export const calculatePreviousBillingDate = (nextBillingDate: string, period: Period): Date => {
  const nextDate = new Date(nextBillingDate);
  const prevDate = new Date(nextDate);

  switch (period) {
    case "DAILY":
      prevDate.setDate(prevDate.getDate() - 1);
      break;
    case "WEEKLY":
      prevDate.setDate(prevDate.getDate() - 7);
      break;
    case "MONTHLY":
      prevDate.setMonth(prevDate.getMonth() - 1);
      // Handle month with different number of days
      if (prevDate.getMonth() !== nextDate.getMonth() - 1 && nextDate.getMonth() !== 0) {
        prevDate.setDate(0); // Set to last day of previous month
      }
      break;
    case "QUARTERLY":
      prevDate.setMonth(prevDate.getMonth() - 3);
      // Handle month with different number of days
      if (prevDate.getMonth() !== nextDate.getMonth() - 3) {
        prevDate.setDate(0); // Set to last day of previous month
      }
      break;
    case "YEARLY":
      prevDate.setFullYear(prevDate.getFullYear() - 1);
      // Handle leap year edge case for Feb 29
      if (nextDate.getMonth() === 1 && nextDate.getDate() === 29) {
        if (!isLeapYear(prevDate.getFullYear())) {
          prevDate.setDate(28);
        }
      }
      break;
  }

  return prevDate;
};

/**
 * Calculates days between two dates
 */
export const daysBetweenDates = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Formats relative time (e.g., "2 days ago", "1 week ago")
 */
export const formatRelativeTime = (days: number): string => {
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
};

/**
 * Checks if a year is a leap year
 */
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Calculates days until next billing date
 */
export const daysUntilBilling = (nextBillingDate: string): number => {
  const today = new Date();
  const billing = new Date(nextBillingDate);
  const timeDiff = billing.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};
