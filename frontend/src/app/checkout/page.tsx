"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { apiFetch } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, isInitialized, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Redirigir si no está inicializado o si el carrito está vacío
  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando checkout...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 container mx-auto px-4">
        <span className="text-6xl opacity-40">🛒</span>
        <h2 className="text-2xl font-bold text-slate-800">Tu carrito está vacío</h2>
        <p className="text-slate-500 max-w-md">Parece que aún no has seleccionado ninguna obra. Explora nuestras colecciones para encontrar piezas únicas.</p>
        <SoftButton variant="primary" onClick={() => router.push('/')}>
          Volver a la tienda
        </SoftButton>
      </div>
    );
  }

  const shippingCost = totalPrice > 2000 ? 0 : 50; // Envío gratis en órdenes mayores a $2000
  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setCheckoutError(null);

    const formData = new FormData(e.currentTarget);
    const shipping_address = {
      full_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      street_address: formData.get('address') as string,
      city: formData.get('city') as string,
      state_province: formData.get('state') as string || 'N/A',
      postal_code: formData.get('postalCode') as string,
      country_code: formData.get('country') as string,
    };

    try {
      const token = sessionStorage.getItem('gk_access_token') || undefined;
      
      const payload = {
        currency: 'USD',
        shipping_address,
        items: items.map(item => ({ product_id: item.artwork.id, quantity: item.quantity }))
      };

      // apiFetch devuelve el objeto en .data automáticamente si fue exitoso
      const result = await apiFetch<{ order_id: string }>('/checkout/draft-invoice', {
        method: 'POST',
        body: payload,
        token
      });

      clearCart();
      router.push(`/checkout/success?order_id=${result.order_id}`);
    } catch (err) {
      setCheckoutError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Finalizar Compra</h1>
      
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Formulario (Columna Izquierda, 7 columnas) */}
        <div className="lg:col-span-7 space-y-10">
          
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {checkoutError && <ToastAlert message={checkoutError} type="error" onClose={() => setCheckoutError(null)} />}
            
            {/* Datos de Envío */}
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Datos de Envío</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <SoftInput label="Nombre" name="firstName" placeholder="Tu nombre" required />
                <SoftInput label="Apellidos" name="lastName" placeholder="Tus apellidos" required />
              </div>
              <SoftInput label="Correo electrónico" name="email" type="email" placeholder="ejemplo@correo.com" required />
              <SoftInput label="Dirección física" name="address" placeholder="Calle, número, apartamento" required />
              <div className="grid md:grid-cols-4 gap-4">
                <SoftInput label="Ciudad" name="city" placeholder="Tu ciudad" required />
                <SoftInput label="Estado/Provincia" name="state" placeholder="Tu estado" required />
                <SoftInput label="País" name="country" placeholder="Tu país (ej. US)" required />
                <SoftInput label="Código Postal" name="postalCode" placeholder="12345" required />
              </div>
            </section>

            {/* Método de Pago */}
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Método de Pago</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Opción Stripe */}
                <div 
                  onClick={() => setPaymentMethod('stripe')}
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center transition-all ${
                    paymentMethod === 'stripe' 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    paymentMethod === 'stripe' ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Tarjeta de Crédito</p>
                    <p className="text-xs text-slate-500">Procesado de forma segura vía Stripe</p>
                  </div>
                </div>

                {/* Opción PayPal */}
                <div 
                  onClick={() => setPaymentMethod('paypal')}
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center transition-all ${
                    paymentMethod === 'paypal' 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    paymentMethod === 'paypal' ? 'border-blue-600' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">PayPal</p>
                    <p className="text-xs text-slate-500">Paga con tu cuenta o saldo</p>
                  </div>
                </div>
              </div>

              {/* Contenedor del form de tarjeta simulado */}
              {paymentMethod === 'stripe' && (
                <div className="mt-6 bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
                  <SoftInput label="Número de tarjeta" placeholder="0000 0000 0000 0000" />
                  <div className="grid grid-cols-2 gap-4">
                    <SoftInput label="Fecha de exp. (MM/AA)" placeholder="12/25" />
                    <SoftInput label="CVC" placeholder="123" type="password" />
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>

        {/* Resumen de Orden (Columna Derecha, 5 columnas) */}
        <div className="lg:col-span-5 relative">
          {/* El contenedor sticky mantiene el resumen visible al hacer scroll si hay muchos campos */}
          <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] space-y-6">
            <h2 className="text-xl font-semibold text-slate-800">Resumen de la Orden</h2>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.artwork.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {item.artwork.images && item.artwork.images[0] !== '' && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.artwork.images[0]} alt={item.artwork.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 text-sm flex flex-col justify-center">
                    <p className="font-medium text-slate-800">{item.artwork.title}</p>
                    <p className="text-slate-500">Cant: {item.quantity}</p>
                    <p className="font-medium text-slate-800 mt-1">${(item.artwork.price * item.quantity).toLocaleString('en-US')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800">${totalPrice.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío estimado</span>
                <span className="font-medium text-slate-800">
                  {shippingCost === 0 ? <span className="text-green-600">Gratis</span> : `$${shippingCost.toLocaleString('en-US')}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
              <span className="font-semibold text-slate-800 text-lg">Total Final</span>
              <span className="font-bold text-2xl text-slate-900">${finalTotal.toLocaleString('en-US')}</span>
            </div>

            <div className="pt-4">
              <SoftButton 
                type="submit"
                form="checkout-form"
                variant="primary" 
                className="w-full py-4 text-lg"
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando Pago...' : 'Confirmar y Proceder al Pago'}
              </SoftButton>
              <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                🔒 Transacción encriptada y segura
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
