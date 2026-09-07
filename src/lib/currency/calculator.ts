import { CurrencyCode } from '@/types';

// Default exchange rate: 1 USD = 0.92 EUR
const DEFAULT_USD_TO_EUR_RATE = 0.92;

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', decimals: 2 },
};

/**
 * Gets current exchange rate between USD and EUR.
 */
export function getExchangeRateUSDToEUR(): number {
  const envRate = process.env.USD_TO_EUR_EXCHANGE_RATE;
  if (envRate && !isNaN(parseFloat(envRate))) {
    return parseFloat(envRate);
  }
  return DEFAULT_USD_TO_EUR_RATE;
}

/**
 * Round a monetary value strictly to 2 decimal places.
 */
export function roundToTwoDecimals(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Convert an amount between USD and EUR.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) {
    return roundToTwoDecimals(amount);
  }

  const usdToEur = getExchangeRateUSDToEUR();

  if (from === 'USD' && to === 'EUR') {
    return roundToTwoDecimals(amount * usdToEur);
  }

  if (from === 'EUR' && to === 'USD') {
    return roundToTwoDecimals(amount / usdToEur);
  }

  return roundToTwoDecimals(amount);
}

/**
 * Formats monetary amount for localized display.
 * Example: formatCurrency(15.5, 'USD') -> "$15.50 USD"
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const rounded = roundToTwoDecimals(amount).toFixed(2);
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  return `${config.symbol}${rounded} ${currency}`;
}

/**
 * Validates that currency string is supported.
 */
export function isValidCurrency(currency: string): currency is CurrencyCode {
  return currency === 'USD' || currency === 'EUR';
}
