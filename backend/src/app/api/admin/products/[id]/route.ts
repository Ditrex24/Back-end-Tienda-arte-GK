import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/middleware/admin';
import { supabaseRestQuery } from '@/lib/supabase-rest';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Autenticación de administrador
  const adminAuth = await authenticateAdminRequest(req);
  if (adminAuth.errorResponse) return adminAuth.errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();

    // Validar y extraer campos permitidos
    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.price !== undefined) updateData.price = Number(body.price);
    const compareAt = body.compare_at_price !== undefined ? body.compare_at_price : body.compareAtPrice;
    if (compareAt !== undefined) {
      updateData.compare_at_price = (compareAt === '' || compareAt === null) ? null : Number(compareAt);
    }
    const stockVal = body.stock_quantity !== undefined ? body.stock_quantity : body.stock;
    if (stockVal !== undefined) updateData.stock_quantity = Number(stockVal);
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No data provided to update' }, { status: 400 });
    }

    // Usar la clave de servicio (privilegiada) para actualizar
    const rows = await supabaseRestQuery<any[]>({
      table: 'products',
      query: `id=eq.${id}`,
      method: 'PATCH',
      body: updateData,
      useServiceRole: true, 
    });

    // Manejar actualización de imagen si fue proporcionada
    const newImageUrl = body.image_url ?? (Array.isArray(body.images) ? body.images[0] : undefined);
    if (newImageUrl) {
      const existingImages = await supabaseRestQuery<any[]>({
        table: 'product_images',
        query: `product_id=eq.${id}&is_primary=eq.true`,
        method: 'GET',
        useServiceRole: true,
      });

      if (existingImages && existingImages.length > 0) {
        await supabaseRestQuery({
          table: 'product_images',
          query: `id=eq.${existingImages[0].id}`,
          method: 'PATCH',
          body: { image_url: newImageUrl },
          useServiceRole: true,
        });
      } else {
        await supabaseRestQuery({
          table: 'product_images',
          query: '',
          method: 'POST',
          body: {
            product_id: id,
            image_url: newImageUrl,
            is_primary: true,
          },
          useServiceRole: true,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Producto actualizado exitosamente', data: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error actualizando producto';
    console.error(`[PUT /api/admin/products/[id]] Error:`, message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
