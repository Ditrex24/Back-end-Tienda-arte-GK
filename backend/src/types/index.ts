// =============================================================================
// DOMAIN TYPE DEFINITIONS & API INTERFACES
// =============================================================================

export type UserRole = 'admin' | 'customer';
export type ProductType = 'original' | 'print';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';
export type GenderType = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';
export type CurrencyCode = 'USD' | 'EUR';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  gender: GenderType | null;
  age: number | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  type: ProductType;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface ShippingAddress {
  full_name: string;
  street_address: string;
  apartment_suite?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country_code: string; // ISO 2-letter country code e.g. 'US', 'CA', 'FR', 'DE', 'ES'
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  currency: CurrencyCode;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  unit_price: number;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface BroadcastEmail {
  id: string;
  subject: string;
  body: string;
  sent_at: string;
  sent_by: string | null;
}

// -----------------------------------------------------------------------------
// CHECKOUT & INVOICE TYPES
// -----------------------------------------------------------------------------

export interface DraftInvoiceItem {
  product_id: string;
  title: string;
  type: ProductType;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface DraftInvoicePayload {
  order_id: string;
  currency: CurrencyCode;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  shipping_region: 'North America' | 'Europe' | 'Rest of World';
  shipping_address: ShippingAddress;
  items: DraftInvoiceItem[];
  stock_locked_until: string; // ISO timestamp (15 min expiry)
  accepted_terms_required: boolean;
}

export interface ShippingRates {
  north_america_usd: number;
  europe_eur: number;
  rest_of_world_usd: number;
  exchange_rate_usd_to_eur: number;
}

// -----------------------------------------------------------------------------
// API RESPONSE WRAPPERS
// -----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: unknown;
}
