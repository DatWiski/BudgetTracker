// Currency and financial calculation utilities

/**
 * Rounds a number to 2 decimal places for currency display
 */
export const roundToCurrency = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Formats a number as currency with proper rounding
 */
export const formatCurrency = (amount: number, currency = '$'): string => {
  return `${currency}${roundToCurrency(amount).toFixed(2)}`;
};

/**
 * Converts subscription price to monthly amount based on billing period
 */
export const convertToMonthly = (price: number, billingPeriod: 'MONTHLY' | 'YEARLY' | 'WEEKLY'): number => {
  switch (billingPeriod) {
    case 'YEARLY':
      return roundToCurrency(price / 12);
    case 'WEEKLY':
      return roundToCurrency(price * (52 / 12)); // More precise than 4.33
    case 'MONTHLY':
    default:
      return price;
  }
};