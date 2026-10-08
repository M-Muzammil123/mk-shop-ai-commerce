import { create } from 'zustand';
import { Profile } from '@/types';

interface AuthState {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: Profile) => void;
  setUser: (user: Profile) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  initialize: () => {
    if (typeof window === 'undefined') return;
    try {
      const storedToken = localStorage.getItem('mk_auth_token');
      const storedUser = localStorage.getItem('mk_auth_user');
      if (storedToken && storedUser) {
        set({
          token: storedToken,
          user: JSON.parse(storedUser) as Profile,
          isLoading: false,
        });
        return;
      }
    } catch (e) {
      console.error('Failed to parse auth from storage', e);
    }
    set({ token: null, user: null, isLoading: false });
  },

  setAuth: (token: string, user: Profile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mk_auth_token', token);
      localStorage.setItem('mk_auth_user', JSON.stringify(user));
    }
    set({ token, user, isLoading: false });
  },

  setUser: (user: Profile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mk_auth_user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mk_auth_token');
      localStorage.removeItem('mk_auth_user');
    }
    set({ token: null, user: null, isLoading: false });
  },
}));
