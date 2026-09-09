import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-6 mt-20 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
      <div className="text-center text-sm text-slate-600">
        © {new Date().getFullYear()} GISMAR KARONEN. Todos los derechos reservados.
      </div>
    </footer>
  );
};
