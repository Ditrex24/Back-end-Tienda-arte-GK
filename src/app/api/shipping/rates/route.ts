import { NextRequest, NextResponse } from 'next/server';
import { getShippingMatrixConfig, updateShippingMatrixConfig } from '@/lib/shipping/calculator';
import { authenticateAdminRequest } from '@/middleware/admin';

// GET /api/shipping/rates (Public/Client estimation)
export async function GET() {
  const rates = getShippingMatrixConfig();
  return NextResponse.json({ success: true, data: rates }, { status: 200 });
}

// PUT /api/shipping/rates (Admin rate management)
export async function PUT(req: NextRequest) {
  const adminAuth = await authenticateAdminRequest(req);
  if (adminAuth.errorResponse) return adminAuth.errorResponse;

  try {
    const body = await req.json();
    const updatedRates = updateShippingMatrixConfig(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Shipping matrix rates updated successfully.',
        data: updatedRates,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update shipping rates';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
