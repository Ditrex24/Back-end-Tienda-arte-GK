import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.loginUser(body);

    const response = NextResponse.json({ success: true, data: result }, { status: 200 });

    // Set HTTP-Only Refresh Token Cookie for enterprise security
    response.cookies.set('sb-refresh-token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    const isVerificationErr = message.includes('EMAIL_VERIFICATION_REQUIRED');
    
    return NextResponse.json(
      { success: false, error: message },
      { status: isVerificationErr ? 403 : 401 }
    );
  }
}
