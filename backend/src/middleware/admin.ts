import { NextRequest, NextResponse } from 'next/server';
import { authenticateUserRequest, AuthenticatedUserContext } from './auth';

/**
 * Middleware function that verifies user is authenticated AND holds the 'admin' role.
 */
export async function authenticateAdminRequest(
  req: NextRequest
): Promise<{ adminUser?: AuthenticatedUserContext; errorResponse?: NextResponse }> {
  const authResult = await authenticateUserRequest(req);

  if (authResult.errorResponse || !authResult.user) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Access Denied: Exclusively restricted to system administrators.',
        },
        { status: 403 }
      ),
    };
  }

  return { adminUser: authResult.user };
}
