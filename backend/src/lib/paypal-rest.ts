import { CurrencyCode } from '@/types';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'placeholder-id';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'placeholder-secret';
const PAYPAL_ENV = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

const BASE_URL = PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Obtains an OAuth2 access token from PayPal REST API using native fetch.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal OAuth Token REST Error: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Creates a PayPal Checkout Order via raw v2 REST API.
 */
export async function paypalRestCreateOrder(
  orderId: string,
  totalAmount: number,
  currency: CurrencyCode
) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          custom_id: orderId,
          amount: {
            currency_code: currency,
            value: totalAmount.toFixed(2),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Create Order REST Error: ${errorText}`);
  }

  return await response.json();
}

/**
 * Captures an approved PayPal Order via raw v2 REST API.
 */
export async function paypalRestCaptureOrder(paypalOrderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Capture Order REST Error: ${errorText}`);
  }

  return await response.json();
}

/**
 * Verifies PayPal webhook signature via PayPal REST verification endpoint using native fetch.
 */
export async function verifyPayPalWebhookSignature(
  headers: Record<string, string>,
  rawBody: string,
  webhookId: string
): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('PayPal webhook verification failed:', err);
    return false;
  }
}
