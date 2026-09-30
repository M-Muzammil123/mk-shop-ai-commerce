import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: Profile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
  login: (payload: { email?: string; phone?: string; password?: string }) => Promise<void>;
  loginWithGoogle: (payload: { id_token?: string; credential?: string; access_token?: string; code?: string; redirect_uri?: string; role?: string }) => Promise<void>;
  loginWithApple: (payload: { id_token?: string; code?: string; email?: string; first_name?: string; last_name?: string; role?: string }) => Promise<void>;
  register: (payload: { email: string; password?: string; first_name?: string; last_name?: string; phone?: string; role?: string }) => Promise<void>;
  verifyOtp: (payload: { phone: string; token: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<Profile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      clearError: () => set({ error: null }),

      login: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/login", payload);
          const { access_token, profile } = res.data;
          set({
            token: access_token,
            user: profile,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err: any) {
          set({ error: err.message || "Failed to log in", loading: false });
          throw err;
        }
      },

      loginWithGoogle: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/google", payload);
          const { access_token, profile } = res.data;
          set({
            token: access_token,
            user: profile,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err: any) {
          set({ error: err.message || "Google authentication failed", loading: false });
          throw err;
        }
      },

      loginWithApple: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/apple", payload);
          const { access_token, profile } = res.data;
          set({
            token: access_token,
            user: profile,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err: any) {
          set({ error: err.message || "Apple authentication failed", loading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/register", payload);
          if (res.data?.access_token) {
            set({
              token: res.data.access_token,
              user: res.data,
              isAuthenticated: true,
              loading: false,
            });
          } else {
            set({ loading: false });
          }
          return res.data;
        } catch (err: any) {
          set({ error: err.message || "Failed to register", loading: false });
          throw err;
        }
      },

      verifyOtp: async (payload) => {
        set({ loading: true, error: null });
        try {
          await api.post("/auth/verify-otp", payload);
          set({ loading: false });
        } catch (err: any) {
          set({ error: err.message || "Failed to verify OTP", loading: false });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart-storage");
        }
      },

      updateProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...profile } });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
