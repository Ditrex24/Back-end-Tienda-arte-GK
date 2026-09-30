'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Artwork } from '@/types/artwork.types';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await apiFetch<Artwork[]>('/products');
        setProducts(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Obras</h1>
        <Link href="/admin/productos/nuevo">
          <SoftButton>+ Nueva Obra</SoftButton>
        </Link>
      </div>

      {error && <ToastAlert message={error} type="error" onClose={() => setError(null)} />}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando obras...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-sm font-medium text-slate-500 bg-slate-50/50">
                <th className="p-4 pl-6">Obra</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay obras registradas.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6 flex items-center space-x-4">
                      {product.images && product.images.length > 0 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={product.images[0]} alt={product.title} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">Sin IMG</div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800">{product.title}</p>
                        <p className="text-xs text-slate-500 truncate w-48">{product.description}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 capitalize">{product.type}</td>
                    <td className="p-4 text-slate-600">
                      {product.compareAtPrice && product.compareAtPrice > product.price ? (
                        <div>
                          <span className="line-through text-xs text-slate-400 block">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                          <span className="text-rose-600 font-semibold">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">{product.stock}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {product.stock > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link href={`/admin/productos/${product.id}/editar`}>
                        <span className="inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                          Editar
                        </span>
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
