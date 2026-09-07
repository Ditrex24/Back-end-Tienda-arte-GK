import { supabaseRestQuery } from '@/lib/supabase-rest';
import { stripeRestCreatePaymentIntent } from '@/lib/stripe-rest';
import { paypalRestCreateOrder, paypalRestCaptureOrder } from '@/lib/paypal-rest';
import { convertToStripeAmount } from '@/lib/stripe/client';
import { Order } from '@/types';

export class PaymentService {
  /**
   * Initializes a Stripe Payment Intent using raw Stripe REST API.
   */
  static async createStripePaymentIntent(userId: string, orderId: string, acceptedTerms: boolean) {
    if (!acceptedTerms) {
      throw new Error('TERMS_NOT_ACCEPTED: Explicit acceptance of invoice terms is mandatory before initializing payment.');
    }

    const orders = await supabaseRestQuery<Order[]>({
      table: 'orders',
      query: `id=eq.${orderId}&user_id=eq.${userId}`,
      method: 'GET',
      useServiceRole: true,
    });

    if (!orders || orders.length === 0) {
      throw new Error('Order not found or access unauthorized.');
    }

    const order = orders[0];

    if (order.status !== 'pending') {
      throw new Error(`Order ${orderId} cannot be paid because status is currently '${order.status}'.`);
    }

    const amountInCents = convertToStripeAmount(order.total_amount);

    const paymentIntent = await stripeRestCreatePaymentIntent(amountInCents, order.currency, {
      order_id: order.id,
      user_id: userId,
    });

    return {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: order.total_amount,
      currency: order.currency,
    };
  }

  /**
   * Initializes a PayPal Order using raw PayPal v2 REST API.
   */
  static async createPayPalPaymentOrder(userId: string, orderId: string, acceptedTerms: boolean) {
    if (!acceptedTerms) {
      throw new Error('TERMS_NOT_ACCEPTED: Explicit acceptance of invoice terms is mandatory before initializing payment.');
    }

    const orders = await supabaseRestQuery<Order[]>({
      table: 'orders',
      query: `id=eq.${orderId}&user_id=eq.${userId}`,
      method: 'GET',
      useServiceRole: true,
    });

    if (!orders || orders.length === 0) {
      throw new Error('Order not found or access unauthorized.');
    }

    const order = orders[0];

    if (order.status !== 'pending') {
      throw new Error(`Order ${orderId} is not in pending state.`);
    }

    const paypalOrder = await paypalRestCreateOrder(order.id, order.total_amount, order.currency);

    return {
      paypal_order_id: paypalOrder.id,
      order_id: order.id,
      amount: order.total_amount,
      currency: order.currency,
    };
  }

  /**
   * Captures approved PayPal Order via raw PayPal REST API.
   */
  static async processPayPalCapture(payPalOrderId: string) {
    const captureData = await paypalRestCaptureOrder(payPalOrderId);
    return captureData;
  }
}
