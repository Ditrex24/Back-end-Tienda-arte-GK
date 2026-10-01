import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestQuery } from '@/lib/supabase-rest';

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
  compare_at_price?: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_images: ProductImage[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rows = await supabaseRestQuery<ProductRow[]>({
      table: 'products',
      query: `select=*,product_images(image_url,is_primary)&id=eq.${id}&is_active=eq.true`,
      method: 'GET',
      useServiceRole: false, // Lectura pública
    });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Obra no encontrada' }, { status: 404 });
    }

    const p = rows[0];
    const sorted = [...(p.product_images ?? [])].sort(
      (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
    );

    const artwork = {
      id: p.id,
      title: p.title,
      description: p.description ?? '',
      type: p.type,
      price: p.price,
      compareAtPrice: p.compare_at_price,
      stock: p.stock_quantity,
      images: sorted.map((img) => img.image_url),
      created_at: p.created_at,
    };

    return NextResponse.json({ success: true, data: artwork });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[GET /api/products/[id]] Supabase error:`, message);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
