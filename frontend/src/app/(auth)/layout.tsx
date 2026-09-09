import React from 'react';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
