import { CurrencyCode, ShippingAddress } from '@/types';
import { convertCurrency, roundToTwoDecimals } from '@/lib/currency/calculator';

export type ShippingRegion = 'North America' | 'Europe' | 'Rest of World';

// Country ISO Sets
const NORTH_AMERICA_COUNTRIES = new Set(['US', 'CA', 'MX']);
const EUROPEAN_COUNTRIES = new Set([
  'FR', 'DE', 'ES', 'IT', 'GB', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'FI', 
  'DK', 'IE', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 
  'LT', 'LV', 'EE', 'CY', 'MT', 'LU', 'IS', 'LI', 'MC', 'AD', 'SM', 'VA'
]);

export interface ShippingMatrixConfig {
  northAmericaBaseUSD: number;
  europeBaseEUR: number;
  restOfWorldBaseUSD: number;
}

// In-memory shipping matrix state (can be updated dynamically by Admin)
let currentShippingMatrix: ShippingMatrixConfig = {
  northAmericaBaseUSD: 15.00,
  europeBaseEUR: 25.00,
  restOfWorldBaseUSD: 35.00,
};

export function getShippingMatrixConfig(): ShippingMatrixConfig {
  return { ...currentShippingMatrix };
}

export function updateShippingMatrixConfig(newConfig: Partial<ShippingMatrixConfig>): ShippingMatrixConfig {
  currentShippingMatrix = {
    ...currentShippingMatrix,
    ...newConfig,
  };
  return { ...currentShippingMatrix };
}

/**
 * Determine shipping region from 2-letter ISO country code.
 */
export function getShippingRegion(countryCode: string): ShippingRegion {
  const code = countryCode.trim().toUpperCase();
  if (NORTH_AMERICA_COUNTRIES.has(code)) {
    return 'North America';
  }
  if (EUROPEAN_COUNTRIES.has(code)) {
    return 'Europe';
  }
  return 'Rest of World';
}

export interface ShippingCalculationResult {
  region: ShippingRegion;
  baseFee: number;
  baseCurrency: CurrencyCode;
  feeInSelectedCurrency: number;
  selectedCurrency: CurrencyCode;
}

/**
 * Calculates regional shipping cost converted to customer's chosen checkout currency ('USD' or 'EUR').
 */
export function calculateShippingFee(
  address: ShippingAddress,
  targetCurrency: CurrencyCode
): ShippingCalculationResult {
  const region = getShippingRegion(address.country_code);

  let baseFee: number;
  let baseCurrency: CurrencyCode;

  switch (region) {
    case 'North America':
      baseFee = currentShippingMatrix.northAmericaBaseUSD;
      baseCurrency = 'USD';
      break;
    case 'Europe':
      baseFee = currentShippingMatrix.europeBaseEUR;
      baseCurrency = 'EUR';
      break;
    case 'Rest of World':
    default:
      baseFee = currentShippingMatrix.restOfWorldBaseUSD;
      baseCurrency = 'USD';
      break;
  }

  const feeInSelectedCurrency = convertCurrency(baseFee, baseCurrency, targetCurrency);

  return {
    region,
    baseFee: roundToTwoDecimals(baseFee),
    baseCurrency,
    feeInSelectedCurrency: roundToTwoDecimals(feeInSelectedCurrency),
    selectedCurrency: targetCurrency,
  };
}
