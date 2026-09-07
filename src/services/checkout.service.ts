import { supabaseRestQuery } from '@/lib/supabase-rest';
import {
  CurrencyCode,
  DraftInvoiceItem,
  DraftInvoicePayload,
  Order,
  Product,
  ShippingAddress,
} from '@/types';
import { convertCurrency, roundToTwoDecimals } from '@/lib/currency/calculator';
import { calculateShippingFee } from '@/lib/shipping/calculator';

export interface DraftInvoiceItemInput {
  product_id: string;
  quantity: number;
}

export interface DraftInvoiceInput {
  currency: CurrencyCode;
  shipping_address: ShippingAddress;
  items: DraftInvoiceItemInput[];
}

export class CheckoutService {
  /**
   * Calculates draft invoice, creates pending order in DB, and locks stock for 15 mins.
   */
  static async generateDraftInvoice(
    userId: string,
    input: DraftInvoiceInput
  ): Promise<DraftInvoicePayload> {
    const { currency: targetCurrency, shipping_address, items } = input;

    if (!items || items.length === 0) {
      throw new Error('At least one artwork item is required to generate a checkout invoice.');
    }

    if (!shipping_address || !shipping_address.country_code || !shipping_address.street_address) {
      throw new Error('Complete shipping address payload is required.');
    }

    // Fetch products from PostgREST
    const productIds = items.map((i) => i.product_id);
    const idList = productIds.map((id) => `"${id}"`).join(',');

    const products = await supabaseRestQuery<Product[]>({
      table: 'products',
      query: `id=in.(${idList})&is_active=eq.true`,
      method: 'GET',
      useServiceRole: true,
    });

    if (!products || products.length === 0) {
      throw new Error('Selected artwork products are unavailable or unlisted.');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const invoiceItems: DraftInvoiceItem[] = [];
    let subtotal = 0;

    for (const itemInput of items) {
      const product = productMap.get(itemInput.product_id);
      if (!product) {
        throw new Error(`Product ID ${itemInput.product_id} is no longer active.`);
      }

      // Check unique original artwork limit BEFORE stock check for correct semantic error
      if (product.type === 'original' && itemInput.quantity > 1) {
        throw new Error(`Original artwork "${product.title}" is unique and restricted to 1 piece per order.`);
      }

      if (product.stock_quantity < itemInput.quantity) {
        throw new Error(
          `Insufficient stock for "${product.title}". Requested: ${itemInput.quantity}, Available: ${product.stock_quantity}`
        );
      }


      const unitPriceInTargetCurrency = convertCurrency(product.price, 'USD', targetCurrency);
      const lineTotal = roundToTwoDecimals(unitPriceInTargetCurrency * itemInput.quantity);

      subtotal += lineTotal;

      invoiceItems.push({
        product_id: product.id,
        title: product.title,
        type: product.type,
        quantity: itemInput.quantity,
        unit_price: unitPriceInTargetCurrency,
        total_price: lineTotal,
      });
    }

    subtotal = roundToTwoDecimals(subtotal);

    // Calculate regional shipping fee
    const shippingCalc = calculateShippingFee(shipping_address, targetCurrency);
    const shippingFee = shippingCalc.feeInSelectedCurrency;

    const totalAmount = roundToTwoDecimals(subtotal + shippingFee);

    // Create Pending Order Record via PostgREST
    const insertedOrders = await supabaseRestQuery<Order[]>({
      table: 'orders',
      method: 'POST',
      body: {
        user_id: userId,
        total_amount: totalAmount,
        currency: targetCurrency,
        status: 'pending',
        shipping_address,
      },
      useServiceRole: true,
    });

    if (!insertedOrders || insertedOrders.length === 0) {
      throw new Error('Failed to create pending order record in database.');
    }

    const createdOrder = insertedOrders[0];

    // Insert Line Items
    const orderItemsPayload = invoiceItems.map((item) => ({
      order_id: createdOrder.id,
      product_id: item.product_id,
      unit_price: item.unit_price,
      quantity: item.quantity,
    }));

    await supabaseRestQuery({
      table: 'order_items',
      method: 'POST',
      body: orderItemsPayload,
      useServiceRole: true,
    });

    // 15-minute stock lock ISO string
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      order_id: createdOrder.id,
      currency: targetCurrency,
      subtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      shipping_region: shippingCalc.region,
      shipping_address,
      items: invoiceItems,
      stock_locked_until: lockedUntil,
      accepted_terms_required: true,
    };
  }
}
