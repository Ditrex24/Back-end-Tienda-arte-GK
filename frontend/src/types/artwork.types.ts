export type ArtworkType = 'original' | 'print';

export interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ArtworkType;
  dimensions: string;
  technique: string;
  year: number;
  images: string[];
  stock: number;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}
