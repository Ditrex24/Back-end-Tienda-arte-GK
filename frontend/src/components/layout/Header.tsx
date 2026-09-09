import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="fixed inset-x-0 top-4 mx-auto max-w-6xl px-4">
      <nav className="bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-between px-6 py-3">
        <div className="font-bold text-slate-800">GISMAR KARONEN</div>
        <ul className="flex space-x-6 text-slate-600">
          <li><Link href="#biografia" className="hover:text-slate-800">Biografía</Link></li>
          <li><Link href="#colecciones" className="hover:text-slate-800">Colecciones</Link></li>
          <li><Link href="#boletin" className="hover:text-slate-800">Boletín</Link></li>
        </ul>
        <div className="flex items-center space-x-4 text-slate-600">
          <select className="bg-white rounded-full border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <span className="cursor-pointer">👜</span>
        </div>
      </nav>
    </header>
  );
};
