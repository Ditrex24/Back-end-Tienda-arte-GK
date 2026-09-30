'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Order } from '@/types/order.types';
import { Artwork } from '@/types/artwork.types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ordersData, productsData] = await Promise.all([
          apiFetch<Order[]>('/admin/orders').catch(() => []),
          apiFetch<Artwork[]>('/products').catch(() => []),
        ]);
        
        // Sort orders by newest first
        const sortedOrders = (ordersData || []).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setOrders(sortedOrders);
        setProducts(productsData || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200">Reintentar</button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Cargando métricas del dashboard...</div>;
  }

  // Calculate KPIs
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'completed')
    .reduce((sum, order) => sum + order.total_amount, 0);
  
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  
  const availableProducts = products.filter(p => p.stock > 0).length;
  const outOfStockProducts = products.length - availableProducts;
  const inventoryPercentage = products.length === 0 ? 0 : Math.round((availableProducts / products.length) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard de Inicio</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen general de rendimiento e inventario</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Ingresos Totales</span>
          <span className="text-3xl font-bold text-slate-800">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Órdenes Totales</span>
          <span className="text-3xl font-bold text-slate-800">{orders.length}</span>
        </div>
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Órdenes Pendientes</span>
          <div className="flex items-end space-x-3">
            <span className="text-3xl font-bold text-slate-800">{pendingOrders}</span>
            {pendingOrders > 0 && <span className="text-xs font-medium text-amber-600 mb-1">Requieren atención</span>}
          </div>
        </div>
        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Obras en Catálogo</span>
          <span className="text-3xl font-bold text-slate-800">{products.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventario Progress */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800">Estado del Inventario</h2>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-emerald-700">Disponibles ({availableProducts})</span>
                <span className="font-medium text-rose-600">Agotados ({outOfStockProducts})</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-1000 ease-out" 
                  style={{ width: `${inventoryPercentage}%` }} 
                />
                <div 
                  className="h-full bg-rose-400 transition-all duration-1000 ease-out" 
                  style={{ width: `${100 - inventoryPercentage}%` }} 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center">
              <Link href="/admin/productos" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                Gestionar Catálogo &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Últimas Órdenes */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Ventas Recientes</h2>
            <Link href="/admin/ordenes" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Aún no hay órdenes registradas.</p>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{order.customer_name}</span>
                    <span className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()} &middot; {order.customer_email}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-slate-800">${order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1
                      ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' : ''}
                      ${order.status === 'paid' ? 'bg-blue-100 text-blue-700' : ''}
                      ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                      ${order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : ''}
                    `}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
