import type { CurrencyCode, Product } from '../types/index';
import { convertCurrency, roundToTwoDecimals } from '../lib/currency/calculator';

export interface CartItemInput {
  product_id: string;
  quantity: number;
}

/**
 * Valida que la cantidad solicitada no exceda el inventario de la obra.
 * Lanza un error si hay una infracción de la lógica de negocio (ej. Original > 1, o Stock superado).
 */
export function validateInventory(product: Product, requestedQuantity: number): boolean {
  if (product.type === 'original' && requestedQuantity > 1) {
    throw new Error(`Original artwork "${product.title}" is unique and restricted to 1 piece per order.`);
  }

  if (product.stock_quantity < requestedQuantity) {
    throw new Error(
      `Insufficient stock for "${product.title}". Requested: ${requestedQuantity}, Available: ${product.stock_quantity}`
    );
  }

  return true;
}

/**
 * Calcula el subtotal exacto de una orden basándose en las obras y sus precios convertidos.
 */
export function calculateOrderSubtotal(
  items: CartItemInput[],
  productMap: Map<string, Product>,
  targetCurrency: CurrencyCode
): number {
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      throw new Error(`Product ID ${item.product_id} is missing from map.`);
    }

    validateInventory(product, item.quantity);

    const unitPriceInTargetCurrency = convertCurrency(product.price, 'USD', targetCurrency);
    const lineTotal = unitPriceInTargetCurrency * item.quantity;
    subtotal += lineTotal;
  }

  return roundToTwoDecimals(subtotal);
}
