import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.registerUser(body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
