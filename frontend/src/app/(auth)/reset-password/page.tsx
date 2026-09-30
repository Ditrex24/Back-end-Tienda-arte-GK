'use client';

import { useState } from 'react';
import { SoftInput } from '@/components/ui/SoftInput';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setServerError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setServerError(null);
    setServerSuccess(null);
    setIsSubmitting(true);

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: { email },
      });

      setServerSuccess('Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación. Revisa tu bandeja de entrada.');
      setEmail('');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error al solicitar el reseteo de contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">Recuperar contraseña</h2>
        <p className="text-sm text-slate-500">Ingresa tu correo y te enviaremos las instrucciones</p>
      </div>

      {serverError && <ToastAlert message={serverError} type="error" onClose={() => setServerError(null)} />}
      {serverSuccess && <ToastAlert message={serverSuccess} type="success" onClose={() => setServerSuccess(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <SoftInput
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <SoftButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar correo de recuperación'}
        </SoftButton>
      </form>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="text-slate-700 font-medium hover:underline">
          Volver a Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
