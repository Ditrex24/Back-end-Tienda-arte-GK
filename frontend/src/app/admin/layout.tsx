import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100/50 flex">
      {/* Sidebar Soft UI */}
      <aside className="w-64 bg-white m-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">Panel Admin</h2>
          <p className="text-xs text-slate-400 mt-1">Gismar Karonen</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col space-y-2">
          <Link href="/admin" className="px-4 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-medium">
            Dashboard
          </Link>
          <Link href="/admin/productos" className="px-4 py-2.5 rounded-2xl bg-slate-50 text-slate-900 transition-colors font-medium">
            Productos
          </Link>
          <Link href="/admin/ordenes" className="px-4 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-medium">
            Órdenes
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pl-0 h-screen overflow-hidden flex flex-col">
        <div className="bg-white flex-1 rounded-3xl shadow-sm border border-slate-100 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
