import { apiClient } from './client';
import { Order, Coupon } from '@/types';

export interface OrderCreateInput {
  shipping_address_id?: string;
  billing_address_id?: string;
  coupon_code?: string;
  payment_provider: 'stripe' | 'paypal' | 'razorpay' | 'cod' | string;
}

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    return apiClient<Order[]>('/api/v1/orders');
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    return apiClient<Order>(`/api/v1/orders/${orderId}`);
  },

  placeOrder: async (data: OrderCreateInput): Promise<Order> => {
    return apiClient<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCouponByCode: async (code: string): Promise<Coupon> => {
    return apiClient<Coupon>(`/api/v1/orders/coupons/${code}`);
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    return apiClient<Order>(`/api/v1/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};
