import React from 'react';
import Link from 'next/link';
import { SoftButton } from '@/components/ui/SoftButton';
import { useTranslation } from '@/context/LanguageContext';

export interface ArtworkCardProps {
  id: string;
  title: string;
  price: number | string;
  compareAtPrice?: number | string;
  imageUrl?: string;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  id,
  title,
  price,
  compareAtPrice,
  imageUrl,
}) => {
  const { t } = useTranslation();

  const numericPrice =
    typeof price === 'number'
      ? price
      : parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;

  const numericCompareAt =
    typeof compareAtPrice === 'number'
      ? compareAtPrice
      : compareAtPrice
      ? parseFloat(String(compareAtPrice).replace(/[^0-9.]/g, ''))
      : undefined;

  const hasDiscount =
    numericCompareAt !== undefined &&
    !isNaN(numericCompareAt) &&
    numericCompareAt > numericPrice;

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] relative">
      {hasDiscount && (
        <span className="absolute top-4 right-4 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
          {t('artwork.sale')}
        </span>
      )}
      <Link href={`/obra/${id}`} className="w-full">
        <div className="w-full h-48 mb-4 relative cursor-pointer">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm transition-colors hover:bg-slate-200">
              {t('artwork.noImage')}
            </div>
          )}
        </div>
      </Link>
      <Link href={`/obra/${id}`}>
        <h3 className="text-slate-800 text-lg font-medium mb-2 text-center hover:text-indigo-600 cursor-pointer line-clamp-1">
          {title}
        </h3>
      </Link>

      {/* Precio con soporte de descuento tachado */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        {hasDiscount && (
          <span className="text-slate-400 line-through text-sm font-normal">
            ${numericCompareAt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
        <span className={`text-base font-semibold ${hasDiscount ? 'text-rose-600' : 'text-slate-800'}`}>
          ${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <Link href={`/obra/${id}`} className="w-full mt-auto">
        <SoftButton variant="secondary" className="w-full">
          {t('artwork.viewDetails')}
        </SoftButton>
      </Link>
    </div>
  );
};
