import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/services/webhook.service';

/**
 * DEV-ONLY endpoint: Simulates a successful payment webhook (PayPal/Stripe).
 * STRICTLY BLOCKED in production. Used exclusively for E2E integration testing.
 * Bypasses signature verification to allow controlled local testing.
 */
export async function POST(req: NextRequest) {
  // Hard block in production — never expose this endpoint in prod
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is not available in production.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { order_id, gateway_ref } = body as { order_id: string; gateway_ref?: string };

    if (!order_id || typeof order_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'order_id (string) is required.' },
        { status: 400 }
      );
    }

    const result = await WebhookService.handlePaymentSuccess(
      order_id,
      gateway_ref ?? `TEST-GATEWAY-REF-${Date.now()}`
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Test payment simulation failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
