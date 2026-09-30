"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { Artwork } from '@/types/artwork.types';
import { apiFetch } from '@/lib/api';

export default function ArtworkDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const { t } = useTranslation();
  
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function loadArtwork() {
      try {
        const id = params?.id as string;
        if (!id) return;
        const data = await apiFetch<Artwork>(`/products/${id}`);
        setArtwork(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar la obra');
      } finally {
        setLoading(false);
      }
    }
    loadArtwork();
  }, [params?.id]);

  // Estado de carga (Skeleton UI)
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="w-full aspect-square bg-slate-200 rounded-3xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-12 w-3/4 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-8 w-1/3 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-24 w-full bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-40 w-full bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-14 w-full bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Estado de error / 404 (Obra no encontrada)
  if (error || !artwork) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            🖼️
          </div>
          <h2 className="text-xl font-bold text-slate-800">{t('artwork.notFoundTitle')}</h2>
          <p className="text-sm text-slate-500">
            {t('artwork.notFoundDesc')}
          </p>
          <div className="pt-2">
            <Link href="/" className="inline-block w-full">
              <SoftButton variant="primary" className="w-full">
                {t('artwork.backToGallery')}
              </SoftButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(artwork, 1);
    setShowToast(true);
  };

  const hasDiscount =
    artwork.compareAtPrice !== undefined &&
    artwork.compareAtPrice !== null &&
    artwork.compareAtPrice > artwork.price;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {showToast && (
        <ToastAlert 
          message={t('artwork.addedSuccess')} 
          type="success" 
          onClose={() => setShowToast(false)} 
        />
      )}

      {/* Breadcrumb de navegación */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 flex items-center space-x-1 transition-colors">
          <span>←</span>
          <span>{t('artwork.backToCollections')}</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Columna Izquierda: Galería */}
        <div className="space-y-6">
          <div className="w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.05)] border border-slate-100 relative">
            {artwork.images && artwork.images.length > 0 ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={artwork.images[mainImageIndex]} 
                alt={artwork.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <span className="text-4xl">🎨</span>
                <span className="text-sm">{t('artwork.noImage')}</span>
              </div>
            )}
          </div>
          
          {artwork.images && artwork.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {artwork.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setMainImageIndex(index)}
                  className={`w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    mainImageIndex === index ? 'border-indigo-600 shadow-md' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */ }
                  <img src={img} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wider uppercase rounded-full">
              {artwork.type === 'original' ? t('artwork.singlePiece') : t('artwork.limitedEdition')}
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
              {artwork.title}
            </h1>

            {/* Precio con soporte de descuento tachado */}
            <div className="pt-2">
              {hasDiscount ? (
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl text-slate-400 line-through font-normal">
                    ${artwork.compareAtPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-4xl lg:text-5xl font-bold text-rose-600">
                    ${artwork.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold px-2.5 py-1 rounded-full">
                    {t('artwork.saves')} ${(artwork.compareAtPrice! - artwork.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <p className="text-4xl lg:text-5xl text-slate-800 font-bold">
                  ${artwork.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
            {artwork.description || 'Sin descripción detallada por el artista.'}
          </p>

          <div className="bg-white p-6 rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-4">
            <h3 className="font-semibold text-slate-800">{t('artwork.technicalSheet')}</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-700">{t('artwork.dimensions')}</span>
                <span>{artwork.dimensions || '100x120 cm'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-700">{t('artwork.technique')}</span>
                <span>{artwork.technique || (artwork.type === 'original' ? 'Óleo / Técnica mixta' : 'Impresión Giclée')}</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-700">{t('artwork.year')}</span>
                <span>{artwork.year || 2026}</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="font-medium text-slate-700">{t('artwork.availability')}</span>
                <span className={artwork.stock > 0 ? 'text-emerald-600 font-medium' : 'text-rose-500 font-medium'}>
                  {artwork.stock > 0 
                    ? t('artwork.inStockCount', { count: artwork.stock })
                    : t('artwork.soldOut')
                  }
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <SoftButton 
              variant="primary" 
              className="w-full text-lg py-4 shadow-sm"
              onClick={handleAddToCart}
              disabled={artwork.stock === 0}
            >
              {artwork.stock > 0 ? t('artwork.addToCollection') : t('artwork.soldOut')}
            </SoftButton>
          </div>
        </div>
      </div>
    </div>
  );
}
