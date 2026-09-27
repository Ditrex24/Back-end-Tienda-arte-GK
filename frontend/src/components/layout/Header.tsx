"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const Header: React.FC = () => {
  const { totalCount, isInitialized } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-4 mx-auto max-w-6xl px-4 z-50">
        <nav className="bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-between px-6 py-3">
          <Link href="/" className="font-bold text-slate-800">GISMAR KARONEN</Link>
          <ul className="flex space-x-6 text-slate-600">
            <li><Link href="/#biografia" className="hover:text-slate-800">Biografía</Link></li>
            <li><Link href="/#colecciones" className="hover:text-slate-800">Colecciones</Link></li>
            <li><Link href="/#boletin" className="hover:text-slate-800">Boletín</Link></li>
          </ul>
          <div className="flex items-center space-x-4 text-slate-600">
            <select className="bg-white rounded-full border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <button onClick={() => setIsCartOpen(true)} className="relative cursor-pointer flex items-center focus:outline-none">
              <span className="text-xl">👜</span>
              {isInitialized && totalCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Drawer del Carrito */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
