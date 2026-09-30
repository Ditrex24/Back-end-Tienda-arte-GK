'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { apiFetch } from '@/lib/api';
import { Artwork } from '@/types/artwork.types';

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compare_at_price: '',
    type: 'original',
    stock: '1',
    image_url: '',
  });

  useEffect(() => {
    async function loadArtwork() {
      if (!id) return;
      try {
        const data = await apiFetch<Artwork>(`/products/${id}`);
        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price !== undefined ? String(data.price) : '',
            compare_at_price: data.compareAtPrice !== undefined && data.compareAtPrice !== null ? String(data.compareAtPrice) : '',
            type: data.type || 'original',
            stock: data.stock !== undefined ? String(data.stock) : '1',
            image_url: data.images?.[0] || '',
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos de la obra');
      } finally {
        setLoadingInitial(false);
      }
    }
    loadArtwork();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        throw new Error('El precio de venta debe ser un número válido mayor o igual a 0');
      }

      const compareAtNum = formData.compare_at_price.trim() !== '' 
        ? parseFloat(formData.compare_at_price) 
        : null;

      await apiFetch(`/admin/products/${id}`, {
        method: 'PUT',
        body: {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          price: priceNum,
          compare_at_price: compareAtNum,
          stock: parseInt(formData.stock, 10) || 0,
          image_url: formData.image_url || undefined,
        },
      });

      setSuccessMsg('¡Obra actualizada correctamente! Redirigiendo...');
      setTimeout(() => router.push('/admin/productos'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la obra');
      setLoading(false);
    }
  };

  // Cálculos dinámicos en vivo para la oferta
  const currentPriceNum = parseFloat(formData.price) || 0;
  const compareAtPriceNum = parseFloat(formData.compare_at_price) || 0;
  const isDiscountFilled = formData.compare_at_price.trim() !== '' && !isNaN(compareAtPriceNum);
  const isValidDiscount = isDiscountFilled && compareAtPriceNum > currentPriceNum && currentPriceNum > 0;
  const isInvalidDiscount = isDiscountFilled && compareAtPriceNum <= currentPriceNum && compareAtPriceNum > 0;
  const discountSavings = isValidDiscount ? compareAtPriceNum - currentPriceNum : 0;
  const discountPercent = isValidDiscount ? Math.round((discountSavings / compareAtPriceNum) * 100) : 0;

  if (loadingInitial) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        Cargando datos de la obra...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Editar Obra</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          ← Volver a productos
        </button>
      </div>

      {error && <ToastAlert message={error} type="error" onClose={() => setError(null)} />}
      {successMsg && <ToastAlert message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Imagen */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-700 block">Fotografía actual de la obra</label>
          {formData.image_url ? (
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={formData.image_url} alt={formData.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-square rounded-3xl bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
              Sin imagen asignada
            </div>
          )}
          <div className="pt-2">
            <span className="text-xs text-slate-500 block mb-2 font-medium">Subir o cambiar fotografía:</span>
            <ImageUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>

        {/* Columna Derecha: Campos */}
        <div className="space-y-5">
          <SoftInput
            label="Título de la obra"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
          />
          
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="bg-slate-50 rounded-2xl border border-slate-100/50 focus:outline-none focus:ring-2 focus:ring-slate-200 outline-none px-4 py-2.5 transition-all resize-none text-slate-800"
            />
          </div>

          {/* Configuración de Precios con UX explicativa */}
          <div className="bg-slate-50/70 p-4 rounded-3xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SoftInput
                  label="Precio de Venta ($ USD)"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ej: 150"
                  value={formData.price}
                  onChange={handleChange}
                />
                <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
                  ★ Lo que pagará el cliente
                </span>
              </div>

              <div>
                <SoftInput
                  label="Precio Anterior / Original ($ USD)"
                  name="compare_at_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 200"
                  value={formData.compare_at_price}
                  onChange={handleChange}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Aparecerá con línea en medio (~tachado~)
                </span>
              </div>
            </div>

            {/* Previsualización dinámica de la oferta */}
            {isValidDiscount && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
                <span>🏷️</span>
                <div>
                  <strong>¡Oferta válida!</strong> El cliente verá{' '}
                  <span className="line-through text-slate-400 font-semibold">${compareAtPriceNum.toFixed(2)}</span>{' '}
                  y pagará <strong className="text-emerald-700">${currentPriceNum.toFixed(2)}</strong> (Ahorro de ${discountSavings.toFixed(2)} / -{discountPercent}%).
                </div>
              </div>
            )}

            {isInvalidDiscount && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-800 flex items-center space-x-2">
                <span>⚠️</span>
                <div>
                  <strong>Nota sobre el descuento:</strong> Para que se muestre como oferta tachada, el <em>Precio Anterior</em> (${compareAtPriceNum.toFixed(2)}) debe ser mayor que el <em>Precio de Venta</em> (${currentPriceNum.toFixed(2)}).
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SoftInput
              label="Stock disponible"
              name="stock"
              type="number"
              min="0"
              required
              value={formData.stock}
              onChange={handleChange}
            />

            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-slate-700">Tipo de Obra</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="bg-slate-50 rounded-2xl border border-slate-100/50 focus:outline-none focus:ring-2 focus:ring-slate-200 outline-none px-4 py-2.5 transition-all text-slate-800"
              >
                <option value="original">Original (Pieza única)</option>
                <option value="print">Impresión (Print)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-2xl text-slate-500 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <SoftButton type="submit" disabled={loading}>
              {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
            </SoftButton>
          </div>
        </div>

      </form>
    </div>
  );
}
