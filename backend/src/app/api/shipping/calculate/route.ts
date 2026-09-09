import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingFee } from '@/lib/shipping/calculator';
import { isValidCurrency } from '@/lib/currency/calculator';
import { ShippingAddress } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { shipping_address, currency } = await req.json();

    if (!currency || !isValidCurrency(currency)) {
      return NextResponse.json(
        { success: false, error: "Invalid currency parameter. Must be 'USD' or 'EUR'." },
        { status: 400 }
      );
    }

    // Validate required shipping address fields natively
    const addr = shipping_address as ShippingAddress;
    if (!addr || !addr.country_code || !addr.street_address || !addr.city || !addr.postal_code) {
      return NextResponse.json(
        { success: false, error: 'Missing required shipping address fields: country_code, street_address, city, postal_code.' },
        { status: 400 }
      );
    }

    const result = calculateShippingFee(addr, currency);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Shipping calculation failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
