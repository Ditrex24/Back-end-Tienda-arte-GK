'use client';

import React, { useState } from 'react';
import { SoftButton } from './SoftButton';
import { SoftInput } from './SoftInput';
import { ToastAlert } from './ToastAlert';
import { apiFetch } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

export const NewsletterForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setFeedback({ type: 'error', message: t('auth.emailLabel') });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const result = await apiFetch<{ message?: string }>('/newsletter/subscribe', {
        method: 'POST',
        body: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
        },
      });

      setFeedback({ 
        type: 'success', 
        message: result?.message || t('newsletter.success') 
      });
      setFormData({ firstName: '', lastName: '', email: '' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión.';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full bg-white rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-8 space-y-6">
      <h3 className="text-xl font-medium text-slate-800 text-center">{t('newsletter.title')}</h3>
      <p className="text-sm text-slate-500 text-center -mt-4">{t('newsletter.subtitle')}</p>
      
      {feedback && (
        <ToastAlert 
          message={feedback.message} 
          type={feedback.type} 
          onClose={() => setFeedback(null)} 
        />
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4" noValidate>
        <SoftInput 
          placeholder={t('auth.firstName')} 
          name="firstName" 
          value={formData.firstName}
          onChange={handleChange}
        />
        <SoftInput 
          placeholder={t('auth.lastName')} 
          name="lastName" 
          value={formData.lastName}
          onChange={handleChange}
        />
        <SoftInput 
          placeholder={t('newsletter.placeholder')} 
          type="email" 
          name="email" 
          value={formData.email}
          onChange={handleChange}
          required
        />
        <div className="md:col-span-3 flex justify-center mt-2">
          <SoftButton variant="primary" className="w-auto px-8" type="submit" disabled={loading}>
            {loading ? t('newsletter.subscribing') : t('newsletter.button')}
          </SoftButton>
        </div>
      </form>
    </div>
  );
};
