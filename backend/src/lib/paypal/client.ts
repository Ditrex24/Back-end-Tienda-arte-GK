import { CurrencyCode } from '@/types';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'placeholder-id';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'placeholder-secret';
const PAYPAL_ENV = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

const BASE_URL = PAYPAL_ENV === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

/**
 * Fetch OAuth2 Access Token from PayPal API.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to obtain PayPal OAuth token: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal v2 Checkout Order.
 */
export async function createPayPalOrder(
  orderId: string,
  totalAmount: number,
  currency: CurrencyCode
) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`PayPal Create Order failed: ${errorText}`);
  }

  return await response.json();
}

/**
 * Capture a PayPal Order after approval.
 */
export async function capturePayPalOrder(payPalOrderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${BASE_URL}/v2/checkout/orders/${payPalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Capture Order failed: ${errorText}`);
  }

  return await response.json();
}

/**
 * Verify PayPal Webhook Signature.
 */
export async function verifyPayPalWebhookSignature(
  headers: Record<string, string>,
  body: string,
  webhookId: string
): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('PayPal webhook verification error:', err);
    return false;
  }
}
