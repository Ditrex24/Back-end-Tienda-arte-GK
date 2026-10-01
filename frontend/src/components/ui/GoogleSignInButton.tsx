'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';

interface GoogleSignInButtonProps {
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pputxkogqablvcdweili.supabase.co';
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const targetUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
      redirectUrl
    )}`;

    window.location.href = targetUrl;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.99] text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {/* Logotipo SVG oficial de Google */}
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      <span>{loading ? t('auth.redirectingGoogle') : t('auth.googleButton')}</span>
    </button>
  );
};
