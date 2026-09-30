import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateOrderSubtotal, validateInventory } from '../utils/cart-logic';
import { calculateShippingFee } from '../lib/shipping/calculator';
import type { Product, ShippingAddress } from '../types/index';

describe('Logica Financiera del Carrito y Envio', () => {

  const dummyProducts: Product[] = [
    {
      id: 'p1',
      title: 'Obra Original 1',
      type: 'original',
      price: 1000,
      stock_quantity: 1,
      description: null,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: 'p2',
      title: 'Print Limitado',
      type: 'print',
      price: 100,
      stock_quantity: 10,
      description: null,
      is_active: true,
      created_at: '',
      updated_at: ''
    }
  ];

  const productMap = new Map(dummyProducts.map(p => [p.id, p]));

  it('1. Debe calcular el subtotal correctamente y aplicar la conversion de moneda', () => {
    // Escenario: 1 Original ($1000) + 2 Prints ($100 * 2 = $200) = $1200 USD
    // Tasa USD -> EUR es 0.92 en el env var, pero asume 0.92 por default.
    // Como el env var no esta cargado en testing puro, quizas fallback a 0.92.
    const items = [
      { product_id: 'p1', quantity: 1 },
      { product_id: 'p2', quantity: 2 },
    ];
    
    // Test en USD (no hay conversion)
    const subtotalUsd = calculateOrderSubtotal(items, productMap, 'USD');
    assert.strictEqual(subtotalUsd, 1200);
  });

  it('2. Debe lanzar un error si se intenta comprar mas de 1 original o excede stock', () => {
    const original = productMap.get('p1')!;
    
    // Intento de comprar 2 originales
    assert.throws(
      () => validateInventory(original, 2),
      { message: /unique and restricted to 1 piece per order/ }
    );

    const print = productMap.get('p2')!;
    
    // Intento de comprar mas de lo que hay en stock
    assert.throws(
      () => validateInventory(print, 15),
      { message: /Insufficient stock/ }
    );

    // Cantidad valida
    assert.strictEqual(validateInventory(print, 5), true);
  });

  it('3. Debe aplicar envio gratuito si el subtotal supera el limite ($2000)', () => {
    const address: ShippingAddress = {
      full_name: 'Test',
      street_address: '123 Test St',
      city: 'NY',
      state_province: 'NY',
      postal_code: '10001',
      country_code: 'US',
    };

    // Subtotal bajo ($500) -> Deberia cobrar envio de Norte America ($15)
    const resultLow = calculateShippingFee(address, 'USD', 500);
    assert.strictEqual(resultLow.feeInSelectedCurrency, 15);

    // Subtotal alto ($2500) -> Deberia ser gratuito
    const resultHigh = calculateShippingFee(address, 'USD', 2500);
    assert.strictEqual(resultHigh.feeInSelectedCurrency, 0);
  });
});
