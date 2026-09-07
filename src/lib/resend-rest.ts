import { Order, OrderItem } from '@/types';
import { formatCurrency } from '@/lib/currency/calculator';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_placeholder';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'orders@artgallery.com';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@artgallery.com';

/**
 * Dispatch single email via Resend REST API using native fetch.
 */
export async function resendRestSendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend REST API Error: ${errorText}`);
  }

  return await response.json();
}

/**
 * Dispatch batch emails via Resend Batch REST API using native fetch.
 */
export async function resendRestBatchSendEmails(
  payloads: Array<{ from?: string; to: string; subject: string; html: string }>
) {
  const formattedPayloads = payloads.map((p) => ({
    from: p.from || FROM_EMAIL,
    to: p.to,
    subject: p.subject,
    html: p.html,
  }));

  const response = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedPayloads),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend Batch REST API Error: ${errorText}`);
  }

  return await response.json();
}

/**
 * Dispatch confirmation email to Customer with HTML invoice summary.
 */
export async function sendOrderConfirmationEmailRest(
  customerEmail: string,
  order: Order,
  items: OrderItem[]
) {
  const formattedTotal = formatCurrency(order.total_amount, order.currency);

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.title || 'Artwork Item'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unit_price, order.currency)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - International Art Gallery</title>
      </head>
      <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #111; color: #fff; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
          <h2 style="margin: 0;">International Fine Art Gallery</h2>
        </div>
        <div style="padding: 25px; border: 1px solid #eee; border-top: none; border-radius: 0 0 6px 6px;">
          <h3 style="color: #2e7d32; margin-top: 0;">Order Payment Confirmed!</h3>
          <p>Dear Customer, your artwork order has been processed successfully. Below is your itemized invoice statement.</p>
          
          <table style="width: 100%; margin: 20px 0; font-size: 0.95em;">
            <tr><td><strong>Order Reference:</strong></td><td>${order.id}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${new Date(order.created_at).toLocaleDateString()}</td></tr>
            <tr><td><strong>Shipping Region:</strong></td><td>${order.shipping_address.country_code}</td></tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <p style="font-size: 1.25em; font-weight: bold; margin: 0;">Total Paid: ${formattedTotal}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await resendRestSendEmail(
    customerEmail,
    `Order Confirmation #${order.id.slice(0, 8)} - Fine Art Gallery`,
    html
  );
}

/**
 * Dispatch sales notification email to Admin.
 */
export async function sendAdminSaleAlertRest(order: Order, itemsCount: number) {
  const formattedTotal = formatCurrency(order.total_amount, order.currency);

  const html = `
    <h2>🎉 New Artwork Sale Completed!</h2>
    <p>A new purchase order has been finalized and paid for.</p>
    <ul>
      <li><strong>Order ID:</strong> ${order.id}</li>
      <li><strong>User ID:</strong> ${order.user_id}</li>
      <li><strong>Total Amount:</strong> ${formattedTotal}</li>
      <li><strong>Items Count:</strong> ${itemsCount}</li>
      <li><strong>Country:</strong> ${order.shipping_address.country_code}</li>
    </ul>
  `;

  return await resendRestSendEmail(
    ADMIN_EMAIL,
    `⚡ New Sale Alert [${formattedTotal}] - Order #${order.id.slice(0, 8)}`,
    html
  );
}

/**
 * Dispatch verification email to newly registered user.
 */
export async function sendVerificationEmailRest(customerEmail: string, verificationUrl: string) {
  const html = `
    <h2>Verify Your Account Email</h2>
    <p>Welcome to our International Fine Art Gallery. Please verify your email address to enable order checkout capabilities.</p>
    <p style="margin: 25px 0;">
      <a href="${verificationUrl}" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a>
    </p>
  `;

  return await resendRestSendEmail(customerEmail, 'Verify Your Email - Fine Art Gallery', html);
}
