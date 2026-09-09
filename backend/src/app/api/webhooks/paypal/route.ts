import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/services/webhook.service';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const headersObj: Record<string, string> = {
      'paypal-auth-algo': req.headers.get('paypal-auth-algo') || '',
      'paypal-cert-url': req.headers.get('paypal-cert-url') || '',
      'paypal-transmission-id': req.headers.get('paypal-transmission-id') || '',
      'paypal-transmission-sig': req.headers.get('paypal-transmission-sig') || '',
      'paypal-transmission-time': req.headers.get('paypal-transmission-time') || '',
    };

    const result = await WebhookService.processPayPalWebhook(headersObj, rawBody);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'PayPal Webhook Error';
    console.error('[PayPal Webhook API Error]:', message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
