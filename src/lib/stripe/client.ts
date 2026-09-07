// NOTE: This project uses zero-dependency native fetch for Stripe API calls (see stripe-rest.ts).
// This module only exposes the convertToStripeAmount helper used by payment.service.ts.

/**
 * Helper to convert float currency amount (e.g. 15.50 USD) to lowest currency unit / cents (1550 cents).
 */
export function convertToStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}
