import React from 'react';
import Image from 'next/image';
import { SoftButton } from '@/components/ui/SoftButton';
import { SoftInput } from '@/components/ui/SoftInput';
import { ArtworkCard } from '@/components/ui/ArtworkCard';

export default function Home() {
  return (
    <div className="flex flex-col space-y-20 bg-slate-50 py-20">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-8 container mx-auto px-4 items-center">
        <div className="space-y-6">
          
          
          <h1 className="text-5xl font-bold text-slate-800">- Gismar Karonen -</h1>
          <h2 className="text-5xl font-bold text-slate-800 ">Descubre su visión</h2>
         
          <p className="text-slate-600 max-w-lg">
            Obras que fusionan colores, texturas y emociones, creadas para transformar cualquier espacio.
          </p>
          <SoftButton variant="primary" className="w-auto">Explorar las colecciones</SoftButton>
        </div>
        <div className="relative w-full h-80 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="w-full h-full bg-slate-200" /> {/* placeholder image */}
        </div>
      </section>

      {/* Biografía Section */}
      <section id="biografia" className="grid md:grid-cols-2 gap-8 container mx-auto px-4 items-center">
        <div className="relative w-full h-80 rounded-3xl overflow-hidden">
          <div className="w-full h-full bg-slate-200" /> {/* placeholder artist image */}
        </div>
        <div className="space-y-6">
          <span className="text-sm text-slate-600 uppercase tracking-widest">BIOGRAFÍA</span>
          <h2 className="text-4xl font-semibold text-slate-800">El Artista</h2>
          <p className="text-slate-600">
            Gismar Karonen nació en 1994, y su trayectoria ha evolucionado entre la pintura, el arte digital y su pasion a los animales.
          </p>
          <blockquote className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.04)] p-6 border-l-4 border-slate-200">
            "El arte es un lenguaje que habla directamente al alma sin necesidad de traducción."
          </blockquote>
        </div>
      </section>

      {/* Colecciones Section */}
      <section id="colecciones" className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-semibold text-slate-800 mb-12">Colecciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ArtworkCard title="Obra 1" price="$1200" />
          <ArtworkCard title="Obra 2" price="$950" />
          <ArtworkCard title="Obra 3" price="$1500" />
          <ArtworkCard title="Obra 4" price="$800" />
        </div>
      </section>

      {/* Boletín Section */}
      <section id="boletin" className="flex justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-8 space-y-6">
          <h3 className="text-xl font-medium text-slate-800 text-center">Suscríbete a nuestro boletín</h3>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SoftInput placeholder="Nombre" name="firstName" />
            <SoftInput placeholder="Apellido" name="lastName" />
            <SoftInput placeholder="Correo electrónico" type="email" name="email" />
            <div className="md:col-span-3 flex justify-center">
              <SoftButton variant="primary" className="w-auto px-8">Suscribirse</SoftButton>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
