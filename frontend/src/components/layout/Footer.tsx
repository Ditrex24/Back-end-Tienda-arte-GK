'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { language } = useTranslation();
  return (
    <footer className="bg-white py-6 mt-20 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
      <div className="text-center text-sm text-slate-600">
        © {new Date().getFullYear()} GISMAR KARONEN. {language === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
      </div>
    </footer>
  );
};
