import { apiClient } from './client';
import { TokenResponse, Profile, Address, AddressCreateInput } from '@/types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<TokenResponse> => {
    return apiClient<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone?: string;
    role?: 'customer' | 'admin';
  }): Promise<Profile> => {
    return apiClient<Profile>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  googleLogin: async (idToken: string): Promise<TokenResponse> => {
    return apiClient<TokenResponse>('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
  },

  appleLogin: async (data: { identity_token: string; user_identifier?: string; full_name?: string; email?: string }): Promise<TokenResponse> => {
    return apiClient<TokenResponse>('/api/v1/auth/apple', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: async (): Promise<Profile> => {
    return apiClient<Profile>('/api/v1/auth/me');
  },

  updateMe: async (data: { first_name?: string; last_name?: string; phone?: string }): Promise<Profile> => {
    return apiClient<Profile>('/api/v1/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: { old_password: string; new_password: string }): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAddresses: async (): Promise<Address[]> => {
    return apiClient<Address[]>('/api/v1/auth/addresses');
  },

  createAddress: async (data: AddressCreateInput): Promise<Address> => {
    return apiClient<Address>('/api/v1/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteAddress: async (addressId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/api/v1/auth/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },
};
