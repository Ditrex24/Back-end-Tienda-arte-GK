"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Correo no válido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Error al iniciar sesión');
      }
      // Redirigir al dashboard o página principal
      window.location.href = '/dashboard';
    } catch (e) {
      setServerError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar sesión</h2>
      {serverError && <ToastAlert message={serverError} type="error" />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SoftInput
          label="Correo electrónico"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-400' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
        <SoftInput
          label="Contraseña"
          type="password"
          {...register('password')}
          className={errors.password ? 'border-red-400' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
        <SoftButton type="submit" variant="primary" className="w-full">
          Entrar
        </SoftButton>
      </form>
    </div>
  );
}
