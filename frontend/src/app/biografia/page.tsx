'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { SoftButton } from '@/components/ui/SoftButton';

export default function BiografiaPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* Migas de pan y botón volver */}
      <nav className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-slate-900 transition-colors font-medium">
            {t('biography.backHome')}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{t('biography.title')}</span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{t('biography.backHome')}</span>
        </Link>
      </nav>

      {/* Encabezado Editorial */}
      <header className="space-y-4 max-w-3xl">
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/80 px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-sm">
          {t('biography.badge')}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
          {t('biography.title')}
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-light">
          {t('biography.subtitle')}
        </p>
      </header>

      {/* Sección Principal: Retrato + Narrativa Biográfica */}
      <section className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Columna Izquierda: Retrato y Ficha del Artista */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="relative w-full h-[420px] rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.06)] border border-slate-100 group bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/60 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-28 h-28 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform mb-4">
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{t('biography.title')}</h2>
            <p className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mt-1">
              Artista Plástica & Visual
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {t('biography.photoPortrait')}
            </p>
          </div>

          {/* Ficha Resumida */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Datos Biográficos
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start space-x-3">
                <span className="font-semibold text-slate-800 w-28 flex-shrink-0">Origen:</span>
                <span>Guayana, Venezuela (1994)</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-semibold text-slate-800 w-28 flex-shrink-0">Formación:</span>
                <span>Comunicación Social (UCAB, 2018)</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-semibold text-slate-800 w-28 flex-shrink-0">Mención:</span>
                <span>Mercadotecnia y Producción Audiovisual</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="font-semibold text-slate-800 w-28 flex-shrink-0">Enfoque:</span>
                <span>Pintura al óleo, acrílico, técnica mixta & digital</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Columna Derecha: Narrativa por párrafos */}
        <article className="lg:col-span-7 space-y-6 text-slate-700 leading-relaxed text-base sm:text-lg">
          <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left">
            {t('biography.p1')}
          </p>

          <p>
            {t('biography.p2')}
          </p>

          <p>
            {t('biography.p3')}
          </p>

          <p>
            {t('biography.p4')}
          </p>
        </article>
      </section>

      {/* Cita Textual Reflexiva (Full-width card) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 rounded-3xl p-8 sm:p-12 lg:p-14 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-indigo-100/60">
        <div className="absolute top-6 left-6 sm:top-8 sm:left-10 text-indigo-200/80 pointer-events-none select-none">
          <svg className="w-20 h-20 sm:w-28 sm:h-28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-white/80 px-4 py-1.5 rounded-full inline-block shadow-sm">
            {t('biography.quoteTitle')}
          </span>
          <blockquote className="text-lg sm:text-xl md:text-2xl font-serif italic text-slate-800 leading-relaxed font-normal">
            {t('biography.quote')}
          </blockquote>
          <div className="pt-2">
            <p className="font-semibold text-slate-900 text-base">— {t('biography.title')}</p>
          </div>
        </div>
      </section>

      {/* Galería de Estudio y Proceso Creativo */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('biography.galleryTitle')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('biography.gallerySubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Estudio */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 group">
            <div className="w-full h-64 bg-gradient-to-tr from-slate-200 to-indigo-50 flex items-center justify-center text-slate-400 group-hover:scale-[1.02] transition-transform">
              <div className="text-center space-y-2 p-4">
                <svg className="w-10 h-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs font-medium text-slate-500 block">Fotografía del Espacio</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-800 text-sm">{t('biography.photoStudio')}</h3>
              <p className="text-xs text-slate-500 mt-1">Luz natural y caballete de trabajo en taller.</p>
            </div>
          </div>

          {/* Card 2: Proceso */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 group">
            <div className="w-full h-64 bg-gradient-to-tr from-indigo-50 to-purple-50 flex items-center justify-center text-slate-400 group-hover:scale-[1.02] transition-transform">
              <div className="text-center space-y-2 p-4">
                <svg className="w-10 h-10 mx-auto text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="text-xs font-medium text-slate-500 block">Detalle de Texturas</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-800 text-sm">{t('biography.photoProcess')}</h3>
              <p className="text-xs text-slate-500 mt-1">Superposición de pigmentos y pastas de relieve.</p>
            </div>
          </div>

          {/* Card 3: Bocetos */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 group">
            <div className="w-full h-64 bg-gradient-to-tr from-amber-50 to-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-[1.02] transition-transform">
              <div className="text-center space-y-2 p-4">
                <svg className="w-10 h-10 mx-auto text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-xs font-medium text-slate-500 block">Estudios Preliminares</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-800 text-sm">{t('biography.photoSketches')}</h3>
              <p className="text-xs text-slate-500 mt-1">Exploración gráfica previa sobre papel de algodón.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navegación Final: Explorar Colecciones */}
      <footer className="text-center pt-8 border-t border-slate-200/60 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">
          ¿Deseas conocer sus creaciones?
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explora la galería de obras originales y ediciones limitadas actualmente disponibles.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/#colecciones">
            <SoftButton variant="primary" className="w-auto px-8">
              {t('biography.exploreCollections')}
            </SoftButton>
          </Link>
          <Link href="/">
            <button
              type="button"
              className="py-3 px-6 rounded-2xl text-slate-600 hover:text-slate-900 font-medium text-sm hover:bg-slate-100 transition-colors"
            >
              {t('biography.backHome')}
            </button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
