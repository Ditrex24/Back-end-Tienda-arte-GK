/**
 * api.ts — Helper centralizado de fetch para el frontend.
 *
 * - Centraliza headers JSON y la URL base.
 * - Extrae el campo `error` del cuerpo de respuesta para mensajes claros.
 * - Nunca lanza errores de red silenciosamente: siempre propaga un Error tipado.
 * - Cumple directiva Zero-Trust: usa fetch nativo del navegador, sin Axios ni libs externas.
 */

/** Forma de respuesta estándar del backend GISMAR KARONEN */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Opciones extendidas de fetch (sin body, se construye internamente) */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  /** Token JWT de acceso, si ya se dispone de él (Authorization: Bearer) */
  token?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Realiza una petición fetch a la API y devuelve el campo `data` tipado.
 * Lanza un Error con el mensaje exacto devuelto por el backend en caso de fallo.
 *
 * @example
 * const result = await apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } });
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Incluye cookies HTTP-only (refresh token) en peticiones same-site
    credentials: 'include',
  });

  // Intentar parsear siempre como JSON; si falla, construir error genérico
  let payload: ApiResponse<T>;
  try {
    payload = await res.json();
  } catch {
    throw new Error(`Error de red: la API no devolvió JSON (HTTP ${res.status})`);
  }

  if (!res.ok) {
    // Usar el campo `error` o `message` del payload, o un fallback genérico
    const backendMsg = payload.error ?? payload.message ?? `Error HTTP ${res.status}`;
    throw new Error(backendMsg);
  }

  // La respuesta fue exitosa: devolver el campo `data`
  return payload.data as T;
}
