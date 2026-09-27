/**
 * auth.types.ts — Tipos TypeScript que reflejan las respuestas del backend de Auth.
 * Estos tipos se derivan del AuthService del backend (src/services/auth.service.ts).
 */

/** Perfil de usuario devuelto por el login */
export interface AuthUserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'customer';
  is_email_verified: boolean;
}

/** Payload de respuesta del endpoint POST /auth/login */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUserProfile;
}

/** Payload de respuesta del endpoint POST /auth/signup */
export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

/** Campos requeridos por el backend para registrar un usuario */
export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';
}
