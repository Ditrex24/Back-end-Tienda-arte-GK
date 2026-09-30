'use client';

import React, { useEffect, useState } from 'react';
import { SoftButton } from '@/components/ui/SoftButton';
import { ArtworkCard } from '@/components/ui/ArtworkCard';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { apiFetch } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { Artwork } from '@/types/artwork.types';

export default function Home() {
  const { t } = useTranslation();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtworks() {
      try {
        const data = await apiFetch<Artwork[]>('/products');
        setArtworks(data || []);
      } catch (error) {
        console.error('Error al cargar obras:', error);
      } finally {
        setLoading(false);
      }
    }
    loadArtworks();
  }, []);

  return (
    <div className="flex flex-col space-y-20 bg-slate-50 py-20">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-8 container mx-auto px-4 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-slate-800">{t('home.heroArtist')}</h1>
          <h2 className="text-5xl font-bold text-slate-800">{t('home.heroTitle')}</h2>
          <p className="text-slate-600 max-w-lg">
            {t('home.heroSubtitle')}
          </p>
          <a href="#colecciones" className="inline-block">
            <SoftButton variant="primary" className="w-auto">{t('home.exploreButton')}</SoftButton>
          </a>
        </div>
        <div className="relative w-full h-80 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-medium">
            {t('home.coverImageAlt')}
          </div>
        </div>
      </section>

      {/* Biografía Section */}
      <section id="biografia" className="grid md:grid-cols-2 gap-8 container mx-auto px-4 items-center">
        <div className="relative w-full h-80 rounded-3xl overflow-hidden">
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-medium">
            {t('home.artistPhotoAlt')}
          </div>
        </div>
        <div className="space-y-6">
          <span className="text-sm text-slate-600 uppercase tracking-widest">{t('home.bioTag')}</span>
          <h2 className="text-4xl font-semibold text-slate-800">{t('home.bioTitle')}</h2>
          <p className="text-slate-600 leading-relaxed">
            {t('home.bioText')}
          </p>
          <blockquote className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.04)] p-6 border-l-4 border-slate-200 italic text-slate-700">
            {t('home.bioQuote')}
          </blockquote>
        </div>
      </section>

      {/* Colecciones Section */}
      <section id="colecciones" className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-semibold text-slate-800 mb-12">{t('home.collectionsTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">{t('home.loadingGallery')}</div>
          ) : artworks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">{t('home.noArtworks')}</div>
          ) : (
            artworks.slice(0, 4).map((artwork) => (
              <ArtworkCard 
                key={artwork.id} 
                id={artwork.id} 
                title={artwork.title} 
                price={artwork.price}
                compareAtPrice={artwork.compareAtPrice} 
                imageUrl={artwork.images?.[0]} 
              />
            ))
          )}
        </div>
      </section>

      {/* Boletín Section */}
      <section id="boletin" className="flex justify-center container mx-auto px-4">
        <NewsletterForm />
      </section>
    </div>
  );
}
