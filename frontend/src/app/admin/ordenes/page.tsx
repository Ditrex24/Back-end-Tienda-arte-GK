'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Order, OrderStatus } from '@/types/order.types';
import { ToastAlert } from '@/components/ui/ToastAlert';

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendiente</span>;
    case 'paid': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Pagado</span>;
    case 'shipped': return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Enviado</span>;
    case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completado</span>;
    case 'cancelled': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelado</span>;
    default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">{status}</span>;
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await apiFetch<Order[]>('/admin/orders');
        setOrders(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Órdenes de Compra</h1>
      </div>

      {error && <ToastAlert message={error} type="error" onClose={() => setError(null)} />}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando órdenes...</div>
      ) : (
        <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-sm font-medium text-slate-500">
                <th className="p-4 pl-6">ID Orden</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay órdenes registradas aún.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-600">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800 text-sm">{order.customer_name}</p>
                      <p className="text-xs text-slate-500">{order.customer_email}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link href={`/admin/ordenes/${order.id}`}>
                        <button className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
                          Ver Detalle
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
