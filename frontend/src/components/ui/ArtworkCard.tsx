import React from 'react';
import Image from 'next/image';
import { SoftButton } from '@/components/ui/SoftButton';

export interface ArtworkCardProps {
  title: string;
  price: string;
  imageUrl?: string;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ title, price, imageUrl }) => {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center">
      <div className="w-full h-48 mb-4 relative">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover rounded-2xl" />
        ) : (
          <div className="w-full h-full bg-slate-200 rounded-2xl" />
        )}
      </div>
      <h3 className="text-slate-800 text-lg font-medium mb-2 text-center">{title}</h3>
      <p className="text-slate-600 mb-4">{price}</p>
      <SoftButton variant="secondary" className="w-full">+ Añadir al carrito</SoftButton>
    </div>
  );
};
