"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { SoftButton } from '@/components/ui/SoftButton';
import { ToastAlert } from '@/components/ui/ToastAlert';
import { Artwork } from '@/types/artwork.types';

// Simulamos una base de datos para las obras
const MOCK_ARTWORKS: Record<string, Artwork> = {
  '1': { id: '1', title: 'Obra 1', description: 'Una pieza vibrante que explora la relación entre la luz y el color en espacios abiertos.', price: 1200, type: 'original', dimensions: '120x80 cm', technique: 'Óleo sobre lienzo', year: 2024, images: ['', '', ''], stock: 1 },
  '2': { id: '2', title: 'Obra 2', description: 'Composición abstracta con texturas orgánicas.', price: 950, type: 'original', dimensions: '100x100 cm', technique: 'Acrílico y técnica mixta', year: 2023, images: ['', ''], stock: 1 },
  '3': { id: '3', title: 'Obra 3', description: 'Reproducción de alta calidad en papel de algodón de la obra original.', price: 1500, type: 'print', dimensions: '60x40 cm', technique: 'Giclée Print', year: 2025, images: [''], stock: 50 },
  '4': { id: '4', title: 'Obra 4', description: 'Estudio de sombras sobre tonos pastel.', price: 800, type: 'original', dimensions: '80x60 cm', technique: 'Óleo sobre madera', year: 2024, images: ['', ''], stock: 1 },
};

export default function ArtworkDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Derivamos la obra directamente del id, sin useEffect ni estado extra,
  // ya que son datos estáticos y síncronos.
  const id = params.id as string;
  const artwork: Artwork = MOCK_ARTWORKS[id] || {
    id,
    title: `Obra ${id} (Ejemplo)`,
    description: 'Esta obra ha sido creada mediante capas sucesivas de color que evocan un paisaje onírico y sutil.',
    price: 1500,
    type: 'original',
    dimensions: '100x100 cm',
    technique: 'Óleo sobre lienzo',
    year: 2026,
    images: ['', '', ''],
    stock: 1
  };

  if (!artwork) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-500">Cargando detalles de la obra...</div>;
  }

  const handleAddToCart = () => {
    addItem(artwork, 1);
    setShowToast(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {showToast && (
        <ToastAlert 
          message="¡Añadido a la colección exitosamente!" 
          type="success" 
          onClose={() => setShowToast(false)} 
        />
      )}

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Columna Izquierda: Galería */}
        <div className="space-y-6">
          <div className="w-full aspect-square bg-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all">
            {/* Imagen principal: placeholder */}
          </div>
          
          {artwork.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {artwork.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setMainImageIndex(index)}
                  className={`w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    mainImageIndex === index ? 'border-indigo-600' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-full bg-slate-200" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wider uppercase rounded-full">
              {artwork.type === 'original' ? 'Pieza Única' : 'Edición Limitada'}
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
              {artwork.title}
            </h1>
            <p className="text-3xl text-slate-600 font-light">
              ${artwork.price.toLocaleString('en-US')}
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed text-lg">
            {artwork.description}
          </p>

          <div className="bg-white p-6 rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="font-semibold text-slate-800">Ficha Técnica</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-700">Dimensiones</span>
                <span>{artwork.dimensions}</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-700">Técnica</span>
                <span>{artwork.technique}</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-700">Año de creación</span>
                <span>{artwork.year}</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="font-medium text-slate-700">Disponibilidad</span>
                <span className={artwork.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                  {artwork.stock > 0 ? 'En inventario' : 'Agotado'}
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <SoftButton 
              variant="primary" 
              className="w-full text-lg py-4"
              onClick={handleAddToCart}
              disabled={artwork.stock === 0}
            >
              {artwork.stock > 0 ? 'Añadir a la colección (Carrito)' : 'Agotado'}
            </SoftButton>
          </div>
        </div>
      </div>
    </div>
  );
}
