import { Resend } from 'resend';
import { Order, OrderItem } from '@/types';
import { formatCurrency } from '@/lib/currency/calculator';

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder';
export const resendClient = new Resend(resendApiKey);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'orders@artgallery.com';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@artgallery.com';

/**
 * Dispatch confirmation email to Customer with order breakdown.
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  order: Order,
  items: OrderItem[]
) {
  const formattedTotal = formatCurrency(order.total_amount, order.currency);

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product?.title || 'Artwork Item'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.unit_price, order.currency)}</td>
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
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 10px;">Thank You for Your Order!</h2>
        <p>Your purchase of fine artwork has been confirmed. Below is your official invoice details.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style="color: #2e7d32; font-weight: bold;">PAID</span></p>
        </div>

        <h3>Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <p style="font-size: 1.2em; font-weight: bold;">Total Paid: ${formattedTotal}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 0.85em; color: #777; text-align: center;">
          International Fine Art Gallery &bull; Authentication & Provenance Guaranteed
        </p>
      </body>
    </html>
  `;

  return await resendClient.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Order Confirmation #${order.id.slice(0, 8)} - Fine Art Gallery`,
    html,
  });
}

/**
 * Dispatch sales alert email to Admin.
 */
export async function sendAdminSaleNotificationEmail(order: Order, itemsCount: number) {
  const formattedTotal = formatCurrency(order.total_amount, order.currency);

  const html = `
    <h2>🎉 New Artwork Sale Notification!</h2>
    <p>A new order has been completed and paid for.</p>
    <ul>
      <li><strong>Order ID:</strong> ${order.id}</li>
      <li><strong>Customer ID:</strong> ${order.user_id}</li>
      <li><strong>Total Amount:</strong> ${formattedTotal}</li>
      <li><strong>Total Items:</strong> ${itemsCount}</li>
      <li><strong>Shipping Country:</strong> ${order.shipping_address.country_code}</li>
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}">View Order in Admin Dashboard</a></p>
  `;

  return await resendClient.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `⚡ New Sale Alert [${formattedTotal}] - Order #${order.id.slice(0, 8)}`,
    html,
  });
}

/**
 * Dispatch verification email to newly registered user.
 */
export async function sendVerificationEmail(customerEmail: string, verificationUrl: string) {
  const html = `
    <h2>Verify Your Email Address</h2>
    <p>Welcome to our Fine Art Gallery. Please verify your email address to complete your registration and enable order checkout.</p>
    <p style="margin: 25px 0;">
      <a href="${verificationUrl}" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a>
    </p>
    <p style="font-size: 0.85em; color: #666;">Or copy and paste this link in your browser: ${verificationUrl}</p>
  `;

  return await resendClient.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Verify Your Email - Fine Art Gallery`,
    html,
  });
}

/**
 * Batch delivery mass broadcast mailing service for admins.
 */
export async function sendBatchBroadcastEmail(
  recipientEmails: string[],
  subject: string,
  htmlContent: string
) {
  const BATCH_SIZE = 50;
  const results = [];

  for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
    const batch = recipientEmails.slice(i, i + BATCH_SIZE);

    const emailPayloads = batch.map((email) => ({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: htmlContent,
    }));

    const batchResponse = await resendClient.batch.send(emailPayloads);
    results.push(batchResponse);
  }

  return results;
}
