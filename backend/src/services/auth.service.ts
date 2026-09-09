import {
  supabaseAuthSignUp,
  supabaseAuthSignIn,
  supabaseAuthRecoverPassword,
  supabaseRestQuery,
} from '@/lib/supabase-rest';
import { sendVerificationEmailRest } from '@/lib/resend-rest';
import { GenderType, UserProfile } from '@/types';

export interface SignupInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: GenderType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Registers a new user via Supabase Auth REST API and triggers Resend verification link.
   */
  static async registerUser(input: SignupInput) {
    if (!input.email || !input.password || !input.first_name || !input.last_name) {
      throw new Error('All registration fields (email, password, first_name, last_name) are required.');
    }

    if (typeof input.age !== 'number' || input.age < 18 || input.age > 120) {
      throw new Error('Must be at least 18 years old to register.');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const authData = await supabaseAuthSignUp(input.email, input.password, {
      first_name: input.first_name,
      last_name: input.last_name,
      gender: input.gender,
      age: input.age,
    });

    const user = authData.user || authData;
    if (!user || !user.id) {
      throw new Error('Failed to create user auth account via Supabase REST.');
    }

    // Update profiles table extra fields via PostgREST
    await supabaseRestQuery({
      table: 'profiles',
      query: `id=eq.${user.id}`,
      method: 'PATCH',
      body: {
        gender: input.gender,
        age: input.age,
      },
      useServiceRole: true,
    });

    // Send verification email
    const verificationUrl = `${appUrl}/auth/verify-email?token=${user.id}`;
    try {
      await sendVerificationEmailRest(input.email, verificationUrl);
    } catch (resendErr) {
      console.warn('Resend verification email warning:', resendErr);
    }

    return {
      userId: user.id,
      email: user.email,
      message: 'Registration successful! Please check your email to verify your account before logging in.',
    };
  }

  /**
   * Authenticates user via Supabase Auth REST API and enforces mandatory email verification check.
   */
  static async loginUser(input: LoginInput) {
    if (!input.email || !input.password) {
      throw new Error('Email and password credentials are required.');
    }

    const authResult = await supabaseAuthSignIn(input.email, input.password);

    const user = authResult.user;
    if (!user || !authResult.access_token) {
      throw new Error('Invalid email or password credentials.');
    }

    // MANDATORY EMAIL VERIFICATION CHECK
    const isEmailVerified =
      user.email_confirmed_at !== null || user.app_metadata?.email_verified === true;

    if (!isEmailVerified) {
      throw new Error('EMAIL_VERIFICATION_REQUIRED: You must verify your email address before logging in.');
    }

    // Fetch user profile role from DB
    const profiles = await supabaseRestQuery<UserProfile[]>({
      table: 'profiles',
      query: `id=eq.${user.id}`,
      method: 'GET',
      useServiceRole: true,
    });

    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    return {
      access_token: authResult.access_token,
      refresh_token: authResult.refresh_token,
      expires_in: authResult.expires_in,
      user: {
        id: user.id,
        email: user.email,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        role: profile?.role || 'customer',
        is_email_verified: true,
      },
    };
  }

  /**
   * Dispatches password recovery link via Supabase Auth REST API.
   */
  static async requestPasswordReset(email: string) {
    await supabaseAuthRecoverPassword(email);
    return {
      success: true,
      message: 'Password reset instructions dispatched to email address.',
    };
  }
}
