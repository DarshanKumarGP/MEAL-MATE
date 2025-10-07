export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_PARTNER' | 'ADMIN';
  phone?: string;
  is_verified: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine_type: string;
  phone: string;
  email: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  opening_time: string;
  closing_time: string;
  delivery_fee: string;
  minimum_order: string;
  logo?: string;
  cover_image?: string;
  average_rating: string;
  total_reviews: number;
  is_featured: boolean;
}

export interface MenuItem {
  id: number;
  restaurant: number;
  category: number;
  name: string;
  description: string;
  price: string;
  discount_price?: string;
  image?: string;
  dietary_type: 'VEG' | 'NON_VEG' | 'VEGAN' | 'EGG';
  is_available: boolean;
  preparation_time: number;
}

export interface CartItem {
  id: number;
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
}

export interface Order {
  id: number;
  order_number: string;
  restaurant: Restaurant;
  status: string;
  total_amount: string;
  delivery_fee: string;
  delivery_address: any;
  delivery_phone: string;
  created_at: string;
  estimated_delivery_time?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: string;
}
