import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Estructura para almacenar las peticiones: Map<IP, { count: number, lastReset: number }>
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMITS = {
  auth: { limit: 5, windowMs: 60 * 1000 },     // 5 peticiones por minuto
  checkout: { limit: 10, windowMs: 60 * 1000 } // 10 peticiones por minuto
};

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Manejo de OPTIONS (CORS Preflight)
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders, status: 200 });
  }

  // 2. Procesamiento de Rate Limiting
  let res = NextResponse.next();
  let limitConfig = null;
  
  if (pathname.startsWith('/api/auth')) {
    limitConfig = RATE_LIMITS.auth;
  } else if (pathname.startsWith('/api/checkout')) {
    limitConfig = RATE_LIMITS.checkout;
  }

  if (limitConfig) {
    // Clave = IP + pathname raíz para que cada endpoint tenga su propio contador.
    // En dev local sin proxy, x-forwarded-for no existe → usamos 127.0.0.1.
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown');
    const ip = `${rawIp}:${pathname}`;
    const currentTime = Date.now();
    const record = rateLimitMap.get(ip);

    if (record) {
      if (currentTime - record.lastReset > limitConfig.windowMs) {
        rateLimitMap.set(ip, { count: 1, lastReset: currentTime });
      } else {
        record.count += 1;
        if (record.count > limitConfig.limit) {
          res = new NextResponse(
            JSON.stringify({ error: 'Demasiadas peticiones. Por favor, intenta de nuevo más tarde.' }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((limitConfig.windowMs - (currentTime - record.lastReset)) / 1000).toString(),
              },
            }
          );
        }
      }
    } else {
      rateLimitMap.set(ip, { count: 1, lastReset: currentTime });
    }

    // Garbage collection manual
    if (Math.random() < 0.05) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (currentTime - val.lastReset > Math.max(RATE_LIMITS.auth.windowMs, RATE_LIMITS.checkout.windowMs)) {
          rateLimitMap.delete(key);
        }
      }
    }
  }

  // 3. Inyectar headers CORS en todas las respuestas
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  return res;
}

export const config = {
  matcher: [
    '/api/:path*'
  ],
};
