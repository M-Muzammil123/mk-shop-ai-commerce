import { apiClient } from './client';
import { PaginatedProducts, Product, Category } from '@/types';

export interface ProductFilterParams {
  skip?: number;
  limit?: number;
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: boolean;
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | string;
}

export const productsApi = {
  getProducts: async (params?: ProductFilterParams): Promise<PaginatedProducts> => {
    return apiClient<PaginatedProducts>('/api/v1/products', {
      params: {
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 12,
        search: params?.search,
        category: params?.category,
        min_price: params?.min_price,
        max_price: params?.max_price,
        min_rating: params?.min_rating,
        in_stock: params?.in_stock,
        sort_by: params?.sort_by ?? 'newest',
      },
    });
  },

  getCategories: async (): Promise<Category[]> => {
    return apiClient<Category[]>('/api/v1/products/categories');
  },

  getProduct: async (slugOrId: string): Promise<Product> => {
    return apiClient<Product>(`/api/v1/products/${slugOrId}`);
  },
};
