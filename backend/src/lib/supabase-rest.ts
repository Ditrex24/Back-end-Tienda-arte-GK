const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

export interface SupabaseQueryOptions {
  table: string;
  query?: string; // Query params e.g. "select=*&id=eq.123"
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  useServiceRole?: boolean;
  accessToken?: string;
  prefer?: string;
}

/**
 * Raw native fetch wrapper for Supabase PostgREST Database API.
 */
export async function supabaseRestQuery<T = unknown>(options: SupabaseQueryOptions): Promise<T> {
  const {
    table,
    query = 'select=*',
    method = 'GET',
    body,
    useServiceRole = true,
    accessToken,
    prefer = 'return=representation',
  } = options;

  const apiKey = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${apiKey}`;

  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;

  const headers: Record<string, string> = {
    apikey: apiKey,
    Authorization: authHeader,
    'Content-Type': 'application/json',
  };

  if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
    headers['Prefer'] = prefer;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase REST Error [${table} ${method}]: ${errorText}`);
  }

  const text = await response.text();
  if (!text) return [] as unknown as T;
  return JSON.parse(text) as T;
}

// -----------------------------------------------------------------------------
// SUPABASE AUTH REST API WRAPPERS
// -----------------------------------------------------------------------------

export async function supabaseAuthSignUp(email: string, password: string, metadata: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/auth/v1/signup`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: metadata,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Auth SignUp Error: ${errorText}`);
  }

  return await response.json();
}

export async function supabaseAuthSignIn(email: string, password: string) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Auth SignIn Error: ${errorText}`);
  }

  return await response.json();
}

export async function supabaseAuthGetUser(accessToken: string) {
  const url = `${SUPABASE_URL}/auth/v1/user`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Auth GetUser Error: ${errorText}`);
  }

  return await response.json();
}

export async function supabaseAuthRecoverPassword(email: string) {
  const url = `${SUPABASE_URL}/auth/v1/recover`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Auth Password Recovery Error: ${errorText}`);
  }

  return await response.json();
}

export async function supabaseAuthListUsers() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Admin List Users Error: ${errorText}`);
  }

  return await response.json();
}
