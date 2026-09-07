import { computeHmacSha256Hex, timingSafeCompare } from './crypto-utils';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export interface StripePaymentIntentResponse {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Creates a Stripe Payment Intent using raw native fetch and URL-encoded form parameters.
 */
export async function stripeRestCreatePaymentIntent(
  amountInCents: number,
  currency: string,
  metadata: Record<string, string>
): Promise<StripePaymentIntentResponse> {
  const params = new URLSearchParams();
  params.append('amount', amountInCents.toString());
  params.append('currency', currency.toLowerCase());
  
  for (const [key, value] of Object.entries(metadata)) {
    params.append(`metadata[${key}]`, value);
  }

  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe REST API PaymentIntent Error: ${errorText}`);
  }

  return (await response.json()) as StripePaymentIntentResponse;
}

/**
 * Verifies Stripe webhook cryptographic signature using native node:crypto HMAC-SHA256.
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  if (!signatureHeader || !webhookSecret) return false;

  const elements = signatureHeader.split(',');
  let timestamp = '';
  let v1Signature = '';

  for (const element of elements) {
    const [prefix, val] = element.trim().split('=');
    if (prefix === 't') {
      timestamp = val;
    } else if (prefix === 'v1') {
      v1Signature = val;
    }
  }

  if (!timestamp || !v1Signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const computedSignature = computeHmacSha256Hex(webhookSecret, signedPayload);

  return timingSafeCompare(computedSignature, v1Signature);
}
