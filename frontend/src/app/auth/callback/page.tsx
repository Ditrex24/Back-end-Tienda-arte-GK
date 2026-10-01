'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { ToastAlert } from '@/components/ui/ToastAlert';
import type { LoginResponse } from '@/lib/auth.types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processOAuth = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Extraer parámetros tanto del fragmento (#access_token=...) como del query string (?code=... o ?error=...)
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(window.location.search);

        // 1. Detectar si Supabase devolvió un error
        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error_code') ||
          '';

        if (error) {
          const isProviderDisabled =
            error.includes('unsupported_provider') ||
            error.includes('validation_failed') ||
            errorDescription.includes('provider is not enabled') ||
            errorDescription.includes('Unsupported provider');

          const displayMsg = isProviderDisabled
            ? t('auth.googleProviderNotice')
            : errorDescription || t('auth.googleError');

          setStatus('error');
          setErrorMessage(displayMsg);

          // Redirigir a login después de 2.5s para no bloquear al usuario
          setTimeout(() => {
            router.push(
              `/login?error=${encodeURIComponent(
                isProviderDisabled ? 'provider_not_enabled' : error
              )}`
            );
          }, 2500);
          return;
        }

        // 2. Extraer el token de acceso
        const accessToken =
          hashParams.get('access_token') || searchParams.get('access_token');

        if (!accessToken) {
          // Si no hay token ni error (visita directa a la URL)
          setStatus('error');
          setErrorMessage(t('auth.googleError'));
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // 3. Sincronizar sesión con el backend
        const result = await apiFetch<LoginResponse>('/auth/oauth-success', {
          method: 'POST',
          body: { access_token: accessToken },
        });

        // 4. Almacenar credenciales en sessionStorage
        sessionStorage.setItem('gk_access_token', result.access_token);
        sessionStorage.setItem('gk_user', JSON.stringify(result.user));

        setStatus('success');

        // Redirigir a la página principal actualizando estado
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : t('auth.googleError');
        setStatus('error');
        setErrorMessage(msg);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    processOAuth();
  }, [router, t]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-8 sm:p-10 max-w-md w-full text-center space-y-6">
        {errorMessage && (
          <ToastAlert
            message={errorMessage}
            type="error"
            onClose={() => setErrorMessage(null)}
          />
        )}

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-slate-800">
              {t('auth.redirectingGoogle')}
            </h2>
            <p className="text-sm text-slate-500">
              Verificando credenciales de acceso seguro...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {t('auth.googleSuccess')}
            </h2>
            <p className="text-sm text-slate-500">
              Accediendo a tu cuenta de Gismar Karonen...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              No se pudo completar el acceso
            </h2>
            <p className="text-sm text-slate-600">
              {errorMessage || t('auth.googleError')}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors shadow-sm"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
