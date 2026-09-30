import { Metadata } from 'next';
import { apiFetch } from '@/lib/api';
import { Artwork } from '@/types/artwork.types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const artwork = await apiFetch<Artwork>(`/products/${id}`);
    
    return {
      title: artwork.title,
      description: artwork.description || artwork.technique || 'Obra de arte en Gismar Karonen',
      openGraph: {
        title: artwork.title,
        description: artwork.description || artwork.technique || 'Obra de arte en Gismar Karonen',
        images: artwork.images && artwork.images.length > 0 ? [artwork.images[0]] : [],
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Obra no encontrada',
      description: 'Detalles de la obra de arte',
    };
  }
}

export default function ArtworkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
