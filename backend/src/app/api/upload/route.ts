import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró ningún archivo en la petición.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WEBP.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo excede el tamaño máximo de 5MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar un nombre único para evitar colisiones
    const fileExtension = file.name.split('.').pop() || 'img';
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      Logger.error('Faltan variables de entorno de Supabase');
      return NextResponse.json({ error: 'Error de configuración del servidor.' }, { status: 500 });
    }

    const bucketName = 'product-images';
    
    // Subir el binario mediante REST nativo hacia Supabase Storage
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucketName}/${uniqueFilename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': file.type,
        },
        body: buffer,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => null);
      Logger.error('Error al subir a Supabase', errorData);
      return NextResponse.json({ error: 'Error al subir la imagen al almacenamiento.' }, { status: 502 });
    }

    // Retornar la URL pública del recurso almacenado
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      data: { url: publicUrl },
      url: publicUrl,
    });
  } catch (error) {
    Logger.error('Error en el endpoint de subida', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la subida.' }, { status: 500 });
  }
}
