"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Nombre mínimo 2 caracteres' }),
  email: z.string().email({ message: 'Correo no válido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Las contraseñas no coinciden',
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    setServerSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? 'Error al registrar');
      }
      setServerSuccess('Registro exitoso. Redirigiendo a iniciar sesión...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) {
      setServerError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Crear cuenta</h2>
      {serverError && <ToastAlert message={serverError} type="error" />}
      {serverSuccess && <ToastAlert message={serverSuccess} type="success" />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SoftInput
          label="Nombre"
          type="text"
          {...register('name')}
          className={errors.name ? 'border-red-400' : ''}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        <SoftInput
          label="Correo electrónico"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-400' : ''}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        <SoftInput
          label="Contraseña"
          type="password"
          {...register('password')}
          className={errors.password ? 'border-red-400' : ''}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        <SoftInput
          label="Confirmar contraseña"
          type="password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-red-400' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
        <SoftButton type="submit" variant="primary" className="w-full">
          Registrarse
        </SoftButton>
      </form>
    </div>
  );
}
