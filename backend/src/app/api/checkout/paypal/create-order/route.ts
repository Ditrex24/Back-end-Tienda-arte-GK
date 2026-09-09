import { NextRequest, NextResponse } from 'next/server';
import { authenticateUserRequest, enforceEmailVerification } from '@/middleware/auth';
import { PaymentService, PaymentIntentSchema } from '@/services/payment.service';

export async function POST(req: NextRequest) {
  const authResult = await authenticateUserRequest(req);
  if (authResult.errorResponse || !authResult.user) {
    return authResult.errorResponse!;
  }

  const emailGuardErr = enforceEmailVerification(authResult.user);
  if (emailGuardErr) return emailGuardErr;

  try {
    const body = await req.json();
    const validated = PaymentIntentSchema.parse(body);

    const result = await PaymentService.createPayPalPaymentOrder(
      authResult.user.userId,
      validated.order_id,
      validated.accepted_invoice_terms
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'PayPal order creation failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
