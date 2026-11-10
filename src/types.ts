export interface Category {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  uuid: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  product_count: number; // only the products that use this brand
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

// The short brand info inside a product (no logo: take it from the brands list by uuid).
export interface ProductBrandRef {
  uuid: string;
  name: string;
  slug: string;
}

export interface Product {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category?: ProductCategoryRef;
  brand?: ProductBrandRef;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export type Role = "admin" | "customer";

export interface User {
  uuid: string;
  email: string;
  role: Role;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ApiErrorBody {
  error: string;
  error_description?: string;
}