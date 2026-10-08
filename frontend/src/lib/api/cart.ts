import { apiClient } from './client';
import { Cart, CartItem, WishlistItem } from '@/types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    return apiClient<Cart>('/api/v1/cart');
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<CartItem> => {
    return apiClient<CartItem>('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateCartItem: async (productId: string, quantity: number): Promise<CartItem> => {
    return apiClient<CartItem>(`/api/v1/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeCartItem: async (productId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/api/v1/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>('/api/v1/cart/clear', {
      method: 'POST',
    });
  },

  getWishlist: async (): Promise<WishlistItem[]> => {
    return apiClient<WishlistItem[]>('/api/v1/cart/wishlist');
  },

  addToWishlist: async (productId: string): Promise<WishlistItem> => {
    return apiClient<WishlistItem>('/api/v1/cart/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  removeFromWishlist: async (productId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/api/v1/cart/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },
};
