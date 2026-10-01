import { NextRequest, NextResponse } from 'next/server';
import { supabaseAuthGetUser, supabaseRestQuery } from '@/lib/supabase-rest';
import { UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.access_token || typeof body.access_token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token de acceso de sesión requerido.' },
        { status: 400 }
      );
    }

    const accessToken = body.access_token.trim();

    // 1. Validar el token con Supabase Auth REST
    let authUser: { id?: string; email?: string; user_metadata?: Record<string, any> } | null = null;
    try {
      authUser = await supabaseAuthGetUser(accessToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Sesión OAuth inválida o expirada.' },
        { status: 401 }
      );
    }

    if (!authUser || !authUser.id) {
      return NextResponse.json(
        { success: false, error: 'Sesión OAuth inválida o expirada.' },
        { status: 401 }
      );
    }

    // 2. Comprobar si ya existe un perfil en la tabla 'profiles'
    const profiles = await supabaseRestQuery<UserProfile[]>({
      table: 'profiles',
      query: `id=eq.${authUser.id}`,
      method: 'GET',
      useServiceRole: true,
    });

    let profile = profiles && profiles.length > 0 ? profiles[0] : null;

    // 3. Si no existe, crear el perfil inicial extrayendo metadatos de Google
    if (!profile) {
      const metadata = authUser.user_metadata || {};
      const fullName = (metadata.full_name || metadata.name || '').trim();
      const parts = fullName ? fullName.split(' ') : [];

      const firstName =
        metadata.given_name ||
        metadata.first_name ||
        (parts.length > 0 ? parts[0] : 'Usuario');

      const lastName =
        metadata.family_name ||
        metadata.last_name ||
        (parts.length > 1 ? parts.slice(1).join(' ') : 'Google');

      try {
        const createdProfiles = await supabaseRestQuery<UserProfile[]>({
          table: 'profiles',
          method: 'POST',
          body: {
            id: authUser.id,
            first_name: firstName,
            last_name: lastName,
            role: 'customer',
          },
          useServiceRole: true,
        });

        if (createdProfiles && createdProfiles.length > 0) {
          profile = createdProfiles[0];
        }
      } catch (insertError) {
        console.warn('[POST /api/auth/oauth-success] Profile creation warning:', insertError);
        // Fallback mínimo en memoria
        const now = new Date().toISOString();
        profile = {
          id: authUser.id,
          first_name: firstName,
          last_name: lastName,
          gender: null,
          age: null,
          role: 'customer',
          created_at: now,
          updated_at: now,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        user: {
          id: authUser.id,
          email: authUser.email || '',
          first_name: profile?.first_name || 'Usuario',
          last_name: profile?.last_name || '',
          role: profile?.role || 'customer',
          is_email_verified: true,
        },
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error interno al procesar OAuth.';
    console.error('[POST /api/auth/oauth-success] Error:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
