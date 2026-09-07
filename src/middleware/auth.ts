import { NextRequest, NextResponse } from 'next/server';
import { supabaseAuthGetUser, supabaseRestQuery } from '@/lib/supabase-rest';
import { UserProfile } from '@/types';

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  isEmailVerified: boolean;
  role: 'admin' | 'customer';
}

/**
 * Extracts and verifies JWT bearer token via raw Supabase Auth REST API.
 */
export async function authenticateUserRequest(
  req: NextRequest
): Promise<{ user?: AuthenticatedUserContext; errorResponse?: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Missing or invalid Authorization header' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await supabaseAuthGetUser(token);
    if (!user || !user.id) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: 'Unauthorized or expired session' },
          { status: 401 }
        ),
      };
    }

    // Query user profile from DB via PostgREST to verify role
    const profiles = await supabaseRestQuery<UserProfile[]>({
      table: 'profiles',
      query: `id=eq.${user.id}&select=role`,
      method: 'GET',
      useServiceRole: true,
    });

    const isEmailVerified = user.email_confirmed_at !== null || user.app_metadata?.email_verified === true;
    const role = profiles && profiles.length > 0 ? profiles[0].role : 'customer';

    return {
      user: {
        userId: user.id,
        email: user.email || '',
        isEmailVerified,
        role,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed';
    return {
      errorResponse: NextResponse.json({ success: false, error: msg }, { status: 401 }),
    };
  }
}

/**
 * Guard enforcing mandatory email verification before performing checkout actions.
 */
export function enforceEmailVerification(user: AuthenticatedUserContext): NextResponse | null {
  if (!user.isEmailVerified) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden: Email verification is required before checkout. Please verify your email address.',
      },
      { status: 403 }
    );
  }
  return null;
}
