export interface Category {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  uuid: string;
  image_url: string;
  is_main: boolean;
}

export interface ProductCategoryRef {
  uuid: string;
}

export interface Product {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category?: ProductCategoryRef;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export type Role = "admin" | "customer";

export interface User {
  uuid: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ApiErrorBody {
  error: string;
  error_description?: string;
}
