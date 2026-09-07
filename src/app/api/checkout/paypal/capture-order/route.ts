import { NextRequest, NextResponse } from 'next/server';
import { authenticateUserRequest } from '@/middleware/auth';
import { PaymentService } from '@/services/payment.service';

export async function POST(req: NextRequest) {
  const authResult = await authenticateUserRequest(req);
  if (authResult.errorResponse || !authResult.user) {
    return authResult.errorResponse!;
  }

  try {
    const { paypal_order_id } = await req.json();
    if (!paypal_order_id) {
      return NextResponse.json({ success: false, error: 'paypal_order_id parameter is required' }, { status: 400 });
    }

    const captureData = await PaymentService.processPayPalCapture(paypal_order_id);

    return NextResponse.json({ success: true, data: captureData }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'PayPal order capture failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
