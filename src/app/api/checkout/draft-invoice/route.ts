import { NextRequest, NextResponse } from 'next/server';
import { authenticateUserRequest, enforceEmailVerification } from '@/middleware/auth';
import { CheckoutService } from '@/services/checkout.service';

export async function POST(req: NextRequest) {
  const authResult = await authenticateUserRequest(req);
  if (authResult.errorResponse || !authResult.user) {
    return authResult.errorResponse!;
  }

  // MANDATORY EMAIL VERIFICATION GUARD
  const emailGuardErr = enforceEmailVerification(authResult.user);
  if (emailGuardErr) return emailGuardErr;

  try {
    const body = await req.json();
    const draftInvoice = await CheckoutService.generateDraftInvoice(authResult.user.userId, body);

    return NextResponse.json({ success: true, data: draftInvoice }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate draft invoice';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
