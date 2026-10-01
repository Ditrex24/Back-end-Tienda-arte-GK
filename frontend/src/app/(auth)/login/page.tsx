"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { apiFetch } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import type { LoginResponse } from '@/lib/auth.types';

// ---------------------------------------------------------------------------
// Esquema de validación Zod
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico no válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener mínimo 6 caracteres' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Página de login
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error') || params.get('error_description');
      if (errorParam) {
        if (
          errorParam.includes('provider_not_enabled') ||
          errorParam.includes('validation_failed') ||
          errorParam.includes('Unsupported provider')
        ) {
          setServerError(t('auth.googleProviderNotice'));
        } else {
          setServerError(t('auth.googleError'));
        }
      }
    }
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email: data.email, password: data.password },
      });

      sessionStorage.setItem('gk_access_token', result.access_token);
      sessionStorage.setItem('gk_user', JSON.stringify(result.user));

      setSuccessMsg(`¡Bienvenido, ${result.user.first_name || result.user.email}!`);

      setTimeout(() => router.push('/'), 1200);
    } catch (e) {
      const raw = (e as Error).message;

      if (raw.includes('EMAIL_VERIFICATION_REQUIRED')) {
        setServerError(
          'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.'
        );
      } else {
        setServerError(raw);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">{t('auth.loginTitle')}</h2>
        <p className="text-sm text-slate-500">{t('auth.loginSubtitle')}</p>
      </div>

      {serverError && <ToastAlert message={serverError} type="error" onClose={() => setServerError(null)} />}
      {successMsg && <ToastAlert message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />}

      {/* Botón de Google OAuth */}
      <div className="space-y-4">
        <GoogleSignInButton />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider absolute">
            {t('auth.orDivider')}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <SoftInput
            label={t('auth.emailLabel')}
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? 'border-red-400 focus:ring-red-200' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <SoftInput
            label={t('auth.passwordLabel')}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
            className={errors.password ? 'border-red-400 focus:ring-red-200' : ''}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <div className="flex justify-end mt-2">
            <a href="/reset-password" className="text-xs text-slate-500 hover:text-slate-800 font-medium hover:underline transition-colors">
              {t('auth.forgotPassword')}
            </a>
          </div>
        </div>

        <SoftButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('auth.loggingIn') : t('auth.loginButton')}
        </SoftButton>
      </form>

      <p className="text-center text-sm text-slate-500">
        {t('auth.noAccount')}{' '}
        <a href="/register" className="text-slate-700 font-medium hover:underline">
          {t('auth.registerHere')}
        </a>
      </p>
    </div>
  );
}
