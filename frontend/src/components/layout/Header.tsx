"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTranslation, Language } from '@/context/LanguageContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import type { AuthUserProfile } from '@/lib/auth.types';

export const Header: React.FC = () => {
  const { totalCount, isInitialized } = useCart();
  const { language, setLanguage, t } = useTranslation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<AuthUserProfile | null>(null);

  useEffect(() => {
    const syncUser = () => {
      try {
        const stored = sessionStorage.getItem('gk_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('gk_access_token');
    sessionStorage.removeItem('gk_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <header className="fixed inset-x-0 top-4 mx-auto max-w-6xl px-4 z-50">
        <nav className="bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-between px-6 py-3 transition-all">
          <Link href="/" className="font-bold text-slate-800 tracking-wider text-sm sm:text-base hover:opacity-80 transition-opacity">
            GISMAR KARONEN
          </Link>

          <ul className="hidden md:flex items-center space-x-6 text-slate-600 text-sm font-medium">
            <li><Link href="/#biografia" className="hover:text-slate-900 transition-colors">{t('nav.biography')}</Link></li>
            <li><Link href="/#colecciones" className="hover:text-slate-900 transition-colors">{t('nav.collections')}</Link></li>
            <li><Link href="/#boletin" className="hover:text-slate-900 transition-colors">{t('nav.newsletter')}</Link></li>
            {user?.role === 'admin' && (
              <li>
                <Link href="/admin" className="text-indigo-600 font-semibold hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full text-xs transition-colors">
                  {t('nav.adminPanel')}
                </Link>
              </li>
            )}
          </ul>

          <div className="flex items-center space-x-3 text-slate-600">
            {/* Selector de Idioma ES / EN */}
            <div className="flex items-center bg-slate-100/80 p-0.5 rounded-full text-xs font-semibold border border-slate-200/60">
              <button
                onClick={() => setLanguage('es')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'es'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>

            {/* Botón Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 cursor-pointer flex items-center justify-center focus:outline-none transition-colors"
              aria-label="Abrir carrito"
            >
              <span className="text-xl">👜</span>
              {isInitialized && totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Estado de Autenticación */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <span className="text-xs font-medium text-slate-700 hidden sm:inline-block max-w-[120px] truncate" title={user.email}>
                  {t('nav.hello')}, {user.first_name || user.email.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs font-medium">
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 rounded-full shadow-sm transition-all hidden sm:inline-block"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Drawer del Carrito */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
