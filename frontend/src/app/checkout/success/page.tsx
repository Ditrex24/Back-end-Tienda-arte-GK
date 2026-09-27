"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SoftButton } from '@/components/ui/SoftButton';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || 'ORD-UNKNOWN';

  return (
    <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] max-w-2xl w-full text-center space-y-8 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Success Icon Native SVG */}
      <div className="relative z-10 flex justify-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-8 border-white shadow-sm">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">¡Orden Confirmada!</h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
          Tu pago ha sido procesado exitosamente. Hemos enviado los detalles de la orden a tu correo electrónico.
        </p>
      </div>

      <div className="relative z-10 bg-slate-50 rounded-3xl p-6 my-8 border border-slate-100">
        <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">Número de Orden</p>
        <p className="text-xl font-mono font-semibold text-slate-800">{orderId}</p>
      </div>

      <div className="relative z-10 pt-4">
        <SoftButton 
          variant="primary" 
          className="px-10 py-4 text-lg w-full md:w-auto"
          onClick={() => router.push('/')}
        >
          Volver a la Galería
        </SoftButton>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-slate-50/50">
      <Suspense fallback={<div className="text-slate-500">Cargando confirmación...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
