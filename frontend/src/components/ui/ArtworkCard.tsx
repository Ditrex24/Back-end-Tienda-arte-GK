import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SoftButton } from '@/components/ui/SoftButton';

export interface ArtworkCardProps {
  id: string;
  title: string;
  price: string;
  imageUrl?: string;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ id, title, price, imageUrl }) => {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
      <Link href={`/obra/${id}`} className="w-full">
        <div className="w-full h-48 mb-4 relative cursor-pointer">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover rounded-2xl" />
          ) : (
            <div className="w-full h-full bg-slate-200 rounded-2xl transition-colors hover:bg-slate-300" />
          )}
        </div>
      </Link>
      <Link href={`/obra/${id}`}>
        <h3 className="text-slate-800 text-lg font-medium mb-2 text-center hover:text-indigo-600 cursor-pointer">{title}</h3>
      </Link>
      <p className="text-slate-600 mb-4">{price}</p>
      
      {/* Redirigimos al detalle para añadir, ya que necesitamos más detalles de la obra */}
      <Link href={`/obra/${id}`} className="w-full">
        <SoftButton variant="secondary" className="w-full">Ver Detalles</SoftButton>
      </Link>
    </div>
  );
};
