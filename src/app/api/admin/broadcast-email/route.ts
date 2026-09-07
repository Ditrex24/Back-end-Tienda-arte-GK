import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/middleware/admin';
import { BroadcastService } from '@/services/broadcast.service';

export async function POST(req: NextRequest) {
  // STRICT ADMIN AUTHORIZATION MIDDLEWARE
  const adminAuth = await authenticateAdminRequest(req);
  if (adminAuth.errorResponse || !adminAuth.adminUser) {
    return adminAuth.errorResponse!;
  }

  try {
    const body = await req.json();
    const result = await BroadcastService.sendAdminBroadcast(adminAuth.adminUser.userId, body);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Mass broadcast email failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
