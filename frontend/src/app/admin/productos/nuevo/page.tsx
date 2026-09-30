'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { apiFetch } from '@/lib/api';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'original',
    stock: '1',
    dimensions: '',
    technique: '',
    image_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadSuccess = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      setError('Debes subir una imagen primero.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/admin/products', {
        method: 'POST',
        body: {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          images: [formData.image_url], // Backend expects array of images or similar
        },
      });
      setSuccessMsg('Obra creada correctamente. Redirigiendo...');
      setTimeout(() => router.push('/admin/productos'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la obra');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Nueva Obra</h1>

      {error && <ToastAlert message={error} type="error" onClose={() => setError(null)} />}
      {successMsg && <ToastAlert message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Imagen */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 block">Fotografía de la obra</label>
          <ImageUploader onUploadSuccess={handleUploadSuccess} />
          {formData.image_url && (
            <p className="text-xs text-green-600 font-medium mt-2">Imagen subida con éxito.</p>
          )}
        </div>

        {/* Columna Derecha: Metadatos */}
        <div className="space-y-5">
          <SoftInput label="Título" name="title" required value={formData.title} onChange={handleChange} />
          
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="bg-slate-50 rounded-2xl border border-slate-100/50 focus:outline-none focus:ring-2 focus:ring-slate-200 outline-none px-4 py-2.5 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SoftInput label="Precio (USD)" name="price" type="number" step="0.01" min="0" required value={formData.price} onChange={handleChange} />
            <SoftInput label="Stock" name="stock" type="number" min="0" required value={formData.stock} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SoftInput label="Dimensiones" name="dimensions" placeholder="Ej: 100x120 cm" required value={formData.dimensions} onChange={handleChange} />
            <SoftInput label="Técnica" name="technique" placeholder="Ej: Óleo sobre lienzo" required value={formData.technique} onChange={handleChange} />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Tipo de Obra</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="bg-slate-50 rounded-2xl border border-slate-100/50 focus:outline-none focus:ring-2 focus:ring-slate-200 outline-none px-4 py-2.5 transition-all"
            >
              <option value="original">Original</option>
              <option value="print">Impresión (Print)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-2xl text-slate-500 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <SoftButton type="submit" disabled={loading || !formData.image_url}>
              {loading ? 'Guardando...' : 'Crear Obra'}
            </SoftButton>
          </div>
        </div>

      </form>
    </div>
  );
}
