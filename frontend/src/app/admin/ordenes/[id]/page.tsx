'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Order, OrderStatus } from '@/types/order.types';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { SoftButton } from '@/components/ui/SoftButton';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await apiFetch<Order>(`/admin/orders/${params.id}`);
        setOrder(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar detalle de la orden');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    setError(null);
    try {
      await apiFetch(`/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setOrder({ ...order, status: newStatus });
      setSuccess(`Orden marcada como ${newStatus}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Cargando orden...</div>;
  if (!order) return <div className="text-center py-12 text-slate-500">No se encontró la orden.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && <ToastAlert message={error} type="error" onClose={() => setError(null)} />}
      {success && <ToastAlert message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 text-sm mb-2">&larr; Volver a órdenes</button>
          <h1 className="text-2xl font-bold text-slate-800">Orden #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-slate-500">Creada el {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div>
          {order.status === 'paid' && (
            <SoftButton onClick={() => handleUpdateStatus('shipped')} disabled={updating}>
              Marcar como Enviado
            </SoftButton>
          )}
          {order.status === 'shipped' && (
            <SoftButton onClick={() => handleUpdateStatus('completed')} disabled={updating}>
              Marcar como Completado
            </SoftButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cliente y Envío */}
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Cliente</h3>
            <p className="font-medium text-slate-800">{order.customer_name}</p>
            <p className="text-slate-600 text-sm">{order.customer_email}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Dirección de Envío</h3>
            <p className="text-slate-800 font-medium">{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p className="text-slate-600 text-sm">{order.shipping_address.line2}</p>}
            <p className="text-slate-600 text-sm">
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
            </p>
            <p className="text-slate-600 text-sm font-medium mt-1">{order.shipping_address.country_code}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Estado Actual</h3>
            <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-medium uppercase tracking-wider">
              {order.status}
            </span>
          </div>
        </div>

        {/* Resumen de Compra */}
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Artículos Comprados</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                {item.product?.images?.[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.product.images[0]} alt="Miniatura" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-xs text-slate-400">Sin Img</div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.product?.title || 'Obra Desconocida'}</p>
                  <p className="text-sm text-slate-500">Cant: {item.quantity}</p>
                </div>
                <div className="font-medium text-slate-800">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-200 mt-4 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Total</span>
            <span className="text-xl font-bold text-slate-800">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
