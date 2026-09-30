import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/services/webhook.service';
import { Logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const result = await WebhookService.processStripeWebhook(rawBody, signature);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Stripe Webhook Error';
    Logger.error('Stripe Webhook API Error', error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
