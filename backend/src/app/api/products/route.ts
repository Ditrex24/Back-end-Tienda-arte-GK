import { NextResponse } from 'next/server';
import { supabaseRestQuery } from '@/lib/supabase-rest';

// ---------------------------------------------------------------------------
// Tipos internos del endpoint
// ---------------------------------------------------------------------------
interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

interface ProductRow {
  id: string;
  title: string;
  description: string | null;
  type: 'original' | 'print';
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_images: ProductImage[];
}

// ---------------------------------------------------------------------------
// Datos de fallback — activos SOLO en development si Supabase no responde.
// En producción, un fallo de Supabase retorna HTTP 500 real.
// ---------------------------------------------------------------------------
const FALLBACK_PRODUCTS = [
  {
    id: 'fallback-1',
    title: 'Sinfonía en Azul',
    description: 'Obra abstracta que fusiona tonos del mar y el cielo en un lienzo de gran formato.',
    type: 'original',
    price: 1200.00,
    stock_quantity: 1,
    images: [],
    _fallback: true,
  },
  {
    id: 'fallback-2',
    title: 'La Guardia del Lobo',
    description: 'Retrato realista de un lobo ártico. Técnica mixta sobre papel de algodón.',
    type: 'print',
    price: 350.00,
    stock_quantity: 10,
    images: [],
    _fallback: true,
  },
  {
    id: 'fallback-3',
    title: 'Geometría del Alma',
    description: 'Exploración geométrica con pigmentos naturales. Edición limitada de 5.',
    type: 'print',
    price: 580.00,
    stock_quantity: 5,
    images: [],
    _fallback: true,
  },
  {
    id: 'fallback-4',
    title: 'Vuelo Interior',
    description: 'Técnica de acuarela y tinta china sobre papel artesanal japonés.',
    type: 'original',
    price: 950.00,
    stock_quantity: 1,
    images: [],
    _fallback: true,
  },
];

/**
 * GET /api/products
 *
 * Devuelve el catálogo de obras activas con sus imágenes embebidas.
 * Hace un JOIN PostgREST nativo con `product_images` y transforma la respuesta
 * al formato `Artwork` que consume el frontend (campo `images: string[]`).
 *
 * Seguridad: usa anon_key (lectura pública). Las RLS de Supabase garantizan
 * que solo se devuelven obras con `is_active = true`.
 */
export async function GET() {
  try {
    const rows = await supabaseRestQuery<ProductRow[]>({
      table: 'products',
      // JOIN embebido con product_images — PostgREST los resuelve por FK
      query: 'select=*,product_images(image_url,is_primary)&is_active=eq.true&order=created_at.desc',
      method: 'GET',
      useServiceRole: false, // Lectura pública: usa anon key
    });

    // Transformar al formato Artwork del frontend:
    // product_images[].image_url  →  images: string[]  (primaria primero)
    const artworks = rows.map((p) => {
      const sorted = [...(p.product_images ?? [])].sort(
        (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
      );
      return {
        id: p.id,
        title: p.title,
        description: p.description ?? '',
        type: p.type,
        price: p.price,
        compareAtPrice: (p as any).compare_at_price,
        stock: p.stock_quantity,
        images: sorted.map((img) => img.image_url),
        created_at: p.created_at,
      };
    });

    return NextResponse.json({ success: true, data: artworks });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[GET /api/products] Supabase error:', message);

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'No se pudo cargar el catálogo de obras.' },
        { status: 500 }
      );
    }

    // Desarrollo: fallback de muestra para no bloquear el flujo local
    console.warn('[GET /api/products] Usando datos de fallback (development).');
    return NextResponse.json({ success: true, data: FALLBACK_PRODUCTS });
  }
}
