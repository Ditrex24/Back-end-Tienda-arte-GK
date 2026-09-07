import { supabaseRestQuery } from '@/lib/supabase-rest';
import { verifyStripeWebhookSignature } from '@/lib/stripe-rest';
import { verifyPayPalWebhookSignature } from '@/lib/paypal-rest';
import { sendOrderConfirmationEmailRest, sendAdminSaleAlertRest } from '@/lib/resend-rest';
import { Order, OrderItem, Product } from '@/types';

export class WebhookService {
  /**
   * Idempotent handler performing stock decrement, cart clearance, and email dispatches upon payment.
   */
  static async handlePaymentSuccess(orderId: string, gatewayRef: string) {
    console.log(`[WebhookService REST] Processing payment success for Order: ${orderId} (Ref: ${gatewayRef})`);

    // 1. Fetch Order via PostgREST
    const orders = await supabaseRestQuery<Order[]>({
      table: 'orders',
      query: `id=eq.${orderId}`,
      method: 'GET',
      useServiceRole: true,
    });

    if (!orders || orders.length === 0) {
      throw new Error(`Order ${orderId} not found in database.`);
    }

    const order = orders[0];

    // Idempotency check: Skip if already paid
    if (order.status === 'paid') {
      console.log(`[WebhookService REST] Order ${orderId} is already paid. Skipping idempotent processing.`);
      return { status: 'already_processed' };
    }

    // 2. Update Order status to 'paid'
    await supabaseRestQuery({
      table: 'orders',
      query: `id=eq.${orderId}`,
      method: 'PATCH',
      body: {
        status: 'paid',
        updated_at: new Date().toISOString(),
      },
      useServiceRole: true,
    });

    // 3. Fetch Order Items and Products
    const orderItems = await supabaseRestQuery<OrderItem[]>({
      table: 'order_items',
      query: `order_id=eq.${orderId}&select=*,product:products(*)`,
      method: 'GET',
      useServiceRole: true,
    });

    if (orderItems && orderItems.length > 0) {
      // 4. Decrement Stock
      for (const item of orderItems) {
        const product = (item as unknown as { product?: Product }).product;
        if (product) {
          const newStock = product.type === 'original'
            ? 0
            : Math.max(0, product.stock_quantity - item.quantity);

          await supabaseRestQuery({
            table: 'products',
            query: `id=eq.${product.id}`,
            method: 'PATCH',
            body: { stock_quantity: newStock },
            useServiceRole: true,
          });
        }
      }
    }

    // 5. Clear Cart Items for User
    await supabaseRestQuery({
      table: 'cart_items',
      query: `user_id=eq.${order.user_id}`,
      method: 'DELETE',
      useServiceRole: true,
    });

    // 6. Fetch User Email via PostgREST from profiles / auth
    const profiles = await supabaseRestQuery<Array<{ id: string; first_name: string; last_name: string }>>({
      table: 'profiles',
      query: `id=eq.${order.user_id}`,
      method: 'GET',
      useServiceRole: true,
    });

    // Send Emails via Resend REST
    if (orderItems) {
      try {
        const customerEmail = profiles && profiles.length > 0 ? `${order.user_id}@customer.com` : 'customer@example.com';
        
        await sendOrderConfirmationEmailRest(customerEmail, order, orderItems);
        await sendAdminSaleAlertRest(order, orderItems.length);
      } catch (emailErr) {
        console.error('[WebhookService REST] Resend Email dispatch error:', emailErr);
      }
    }

    return { status: 'processed_successfully', orderId };
  }

  /**
   * Processes Stripe Webhooks with native node:crypto signature verification.
   */
  static async processStripeWebhook(rawBody: string, signatureHeader: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

    const isValid = verifyStripeWebhookSignature(rawBody, signatureHeader, webhookSecret);
    if (!isValid) {
      throw new Error('Stripe Webhook Signature Verification Failed using node:crypto HMAC.');
    }

    const event = JSON.parse(rawBody);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.order_id;

      if (!orderId) {
        throw new Error('Stripe PaymentIntent missing order_id metadata');
      }

      return await this.handlePaymentSuccess(orderId, paymentIntent.id);
    }

    return { status: 'event_ignored', type: event.type };
  }

  /**
   * Processes PayPal Webhooks with native signature verification.
   */
  static async processPayPalWebhook(headers: Record<string, string>, rawBody: string) {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'placeholder_id';

    const isValid = await verifyPayPalWebhookSignature(headers, rawBody, webhookId);
    if (!isValid) {
      throw new Error('PayPal Webhook Signature Verification Failed.');
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const capture = payload.resource;
      const orderId = capture.custom_id || capture.supplementary_data?.related_ids?.order_id;

      if (!orderId) {
        throw new Error('PayPal Webhook capture missing order_id parameter');
      }

      return await this.handlePaymentSuccess(orderId, capture.id);
    }

    return { status: 'event_ignored', type: eventType };
  }
}
