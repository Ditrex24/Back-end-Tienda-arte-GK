import { Artwork } from './artwork.types';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Artwork; // Información expandida de la obra
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[]; // Relación de items
}
