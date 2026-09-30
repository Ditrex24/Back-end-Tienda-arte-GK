import type { MetadataRoute } from 'next';
import { apiFetch } from '@/lib/api';
import { Artwork } from '@/types/artwork.types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gismarkaronen.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reset-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const artworks = await apiFetch<Artwork[]>('/products');
    
    if (artworks && artworks.length > 0) {
      dynamicRoutes = artworks.map((artwork) => ({
        url: `${baseUrl}/obra/${artwork.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error('Sitemap Error: Fallo al cargar las obras de arte', error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
