import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestQuery } from '@/lib/supabase-rest';
import { resendRestSendEmail } from '@/lib/resend-rest';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Cuerpo de la petición inválido.' },
        { status: 400 }
      );
    }

    const { email, first_name, last_name } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Por favor, ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanFirstName = typeof first_name === 'string' ? first_name.trim() : null;
    const cleanLastName = typeof last_name === 'string' ? last_name.trim() : null;

    // 1. Intentar registrar en Supabase (tolerante a fallos si la tabla aún no existe)
    try {
      await supabaseRestQuery({
        table: 'newsletter_subscribers',
        method: 'POST',
        body: {
          email: cleanEmail,
          first_name: cleanFirstName,
          last_name: cleanLastName,
          subscribed_at: new Date().toISOString(),
        },
        useServiceRole: true,
      });
    } catch (dbError) {
      console.warn(
        '[POST /api/newsletter/subscribe] Supabase newsletter_subscribers warning:',
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    // 2. Enviar correo de bienvenida mediante Resend REST API
    try {
      const recipientName = cleanFirstName ? ` ${cleanFirstName}` : '';
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 32px 16px; margin: 0;">
            <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 14px; font-weight: 700; letter-spacing: 2px; color: #1e293b;">GISMAR KARONEN</span>
              </div>
              <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; line-height: 1.3; margin: 0 0 16px;">¡Bienvenido/a a la comunidad de arte!</h1>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                Hola${recipientName}, gracias por suscribirte a nuestro boletín. A partir de ahora serás de los primeros en enterarte sobre nuevas obras originales, lanzamientos de ediciones limitadas y exposiciones exclusivas.
              </p>
              <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9;">
                <p style="margin: 0; color: #334155; font-size: 14px; font-style: italic;">
                  "El arte es un lenguaje que habla directamente al alma sin necesidad de traducción."
                </p>
              </div>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Gismar Karonen — Colecciones de Arte. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resendRestSendEmail(
        cleanEmail,
        '¡Bienvenido/a al Boletín de Arte de Gismar Karonen!',
        htmlContent
      );
    } catch (resendError) {
      console.warn(
        '[POST /api/newsletter/subscribe] Resend dispatch warning:',
        resendError instanceof Error ? resendError.message : resendError
      );
    }

    const successMessage = cleanFirstName
      ? `¡Gracias ${cleanFirstName}! Te has suscrito exitosamente al boletín.`
      : '¡Gracias! Te has suscrito exitosamente al boletín de arte.';

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: { message: successMessage },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error interno al procesar suscripción.';
    console.error('[POST /api/newsletter/subscribe] Unexpected error:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
