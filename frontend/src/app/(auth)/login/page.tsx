"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { apiFetch } from '@/lib/api';
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Almacenar el access_token en sessionStorage (el refresh_token ya
      // queda en cookie HTTP-only segura, establecida por el backend)
      sessionStorage.setItem('gk_access_token', result.access_token);
      sessionStorage.setItem('gk_user', JSON.stringify(result.user));

      setSuccessMsg(`¡Bienvenido, ${result.user.first_name || result.user.email}!`);

      // Pequeña pausa para que el usuario vea el mensaje antes de redirigir
      setTimeout(() => router.push('/'), 1200);
    } catch (e) {
      const raw = (e as Error).message;

      // El backend puede devolver "EMAIL_VERIFICATION_REQUIRED: ..."
      // Mostrar un mensaje limpio y amigable al usuario
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
        <h2 className="text-2xl font-bold text-slate-800">Iniciar sesión</h2>
        <p className="text-sm text-slate-500">Accede a tu cuenta de GISMAR KARONEN</p>
      </div>

      {serverError && <ToastAlert message={serverError} type="error" />}
      {successMsg && <ToastAlert message={successMsg} type="success" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <SoftInput
            label="Correo electrónico"
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
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
            className={errors.password ? 'border-red-400 focus:ring-red-200' : ''}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <SoftButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión…' : 'Entrar'}
        </SoftButton>
      </form>

      <p className="text-center text-sm text-slate-500">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="text-slate-700 font-medium hover:underline">
          Regístrate aquí
        </a>
      </p>
    </div>
  );
}
