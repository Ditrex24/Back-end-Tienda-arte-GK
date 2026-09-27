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
import type { RegisterResponse } from '@/lib/auth.types';

// ---------------------------------------------------------------------------
// Esquema de validación Zod — alineado con SignupInput del backend
// ---------------------------------------------------------------------------
const GENDER_OPTIONS = ['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'] as const;

// Schema del formulario: age llega como string desde el input HTML
// y se transforma a number antes de enviarse al backend
const registerSchema = z
  .object({
    first_name: z.string().min(2, { message: 'El nombre debe tener mínimo 2 caracteres' }),
    last_name: z.string().min(2, { message: 'El apellido debe tener mínimo 2 caracteres' }),
    age: z
      .string()
      .min(1, { message: 'Ingresa tu edad' })
      .transform((val) => parseInt(val, 10))
      .refine((n) => !isNaN(n) && n >= 18 && n <= 120, {
        message: 'Debes tener entre 18 y 120 años',
      }),
    gender: z.enum(GENDER_OPTIONS, { message: 'Selecciona un género' }),
    email: z.string().email({ message: 'Correo electrónico no válido' }),
    password: z
      .string()
      .min(6, { message: 'La contraseña debe tener mínimo 6 caracteres' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Mínimo 6 caracteres' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

// Tipo de los campos del formulario (lo que RHF maneja — age es string)
type RegisterFormData = z.input<typeof registerSchema>;
// Tipo de la salida validada (lo que llega a onSubmit — age es number)
type RegisterFormOutput = z.output<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Labels amigables para el selector de género
// ---------------------------------------------------------------------------
const GENDER_LABELS: Record<(typeof GENDER_OPTIONS)[number], string> = {
  male: 'Hombre',
  female: 'Mujer',
  non_binary: 'No binario',
  prefer_not_to_say: 'Prefiero no decirlo',
  other: 'Otro',
};

// ---------------------------------------------------------------------------
// Página de registro
// ---------------------------------------------------------------------------
export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<RegisterFormData, any, RegisterFormOutput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormOutput) => {
    setServerError(null);
    setServerSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await apiFetch<RegisterResponse>('/auth/signup', {
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          age: data.age,
          gender: data.gender,
        },
      });

      // Mostrar el mensaje de éxito que devuelve el backend
      setServerSuccess(
        result.message ??
          '¡Registro exitoso! Revisa tu correo para verificar tu cuenta antes de iniciar sesión.'
      );

      // Redirigir al login tras 2.5 s para que el usuario lea el mensaje
      setTimeout(() => router.push('/login'), 2500);
    } catch (e) {
      setServerError((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">Crear cuenta</h2>
        <p className="text-sm text-slate-500">Únete a la comunidad de GISMAR KARONEN</p>
      </div>

      {serverError && <ToastAlert message={serverError} type="error" />}
      {serverSuccess && <ToastAlert message={serverSuccess} type="success" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Nombre y apellido en la misma fila */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <SoftInput
              label="Nombre"
              type="text"
              placeholder="María"
              autoComplete="given-name"
              {...register('first_name')}
              className={errors.first_name ? 'border-red-400 focus:ring-red-200' : ''}
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <SoftInput
              label="Apellido"
              type="text"
              placeholder="García"
              autoComplete="family-name"
              {...register('last_name')}
              className={errors.last_name ? 'border-red-400 focus:ring-red-200' : ''}
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Edad y género en la misma fila */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <SoftInput
              label="Edad"
              type="number"
              placeholder="25"
              min={18}
              max={120}
              {...register('age')}
              className={errors.age ? 'border-red-400 focus:ring-red-200' : ''}
            />
            {errors.age && (
              <p className="mt-1 text-xs text-red-600">{errors.age.message}</p>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Género</label>
            <select
              {...register('gender')}
              className={`bg-slate-50 rounded-2xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all ${
                errors.gender ? 'border-red-400 focus:ring-red-200' : 'border-slate-100/50'
              }`}
            >
              <option value="">Seleccionar…</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
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

        {/* Contraseña */}
        <div>
          <SoftInput
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
            className={errors.password ? 'border-red-400 focus:ring-red-200' : ''}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <SoftInput
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-400 focus:ring-red-200' : ''}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <SoftButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando cuenta…' : 'Registrarse'}
        </SoftButton>
      </form>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-slate-700 font-medium hover:underline">
          Inicia sesión
        </a>
      </p>
    </div>
  );
}
