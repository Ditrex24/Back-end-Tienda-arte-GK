'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import esDict from '@/locales/es.json';
import enDict from '@/locales/en.json';

export type Language = 'es' | 'en';

type TranslationsDict = typeof esDict;

const dictionaries: Record<Language, TranslationsDict> = {
  es: esDict,
  en: enDict as unknown as TranslationsDict,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'gk_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && (stored === 'es' || stored === 'en')) {
        setLanguageState(stored);
      }
    } catch {
      // Ignorar errores de SSR/privacy mode
    } finally {
      setMounted(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Fallback
    }
  };

  /**
   * Busca traducciones por clave anidada (ej. `t('nav.biography')` o `t('admin.validDiscountNotice', { price: '$150' })`).
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[language] || dictionaries.es;
    const keys = key.split('.');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = dict;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback a Español si la clave no existe en el idioma actual
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = dictionaries.es;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Si ni en español existe, devuelve la clave raw
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return key;
    }

    // Reemplazo de parámetros {paramName}
    if (params) {
      let result = current;
      Object.entries(params).forEach(([pKey, pVal]) => {
        result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
      return result;
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ language: mounted ? language : 'es', setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation debe ser usado dentro de un LanguageProvider');
  }
  return context;
};
