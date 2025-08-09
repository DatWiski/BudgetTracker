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
export const formatCurrency = (amount: number, currencyCode: 'USD' | 'EUR' = 'USD'): string => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(roundToCurrency(amount));
  } catch {
    // Fallback
    const symbol = currencyCode === 'EUR' ? '€' : '$';
    return `${symbol}${roundToCurrency(amount).toFixed(2)}`;
  }
};

/**
 * Converts subscription price to monthly amount based on billing period
 */
export const convertToMonthly = (
  price: number,
  billingPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
): number => {
  switch (billingPeriod) {
    case 'DAILY':
      // Approximate monthly from daily: 365 days / 12 months
      return roundToCurrency(price * (365 / 12));
    case 'YEARLY':
      return roundToCurrency(price / 12);
    case 'WEEKLY':
      return roundToCurrency(price * (52 / 12)); // More precise than 4.33
    case 'MONTHLY':
    default:
      return price;
  }
};