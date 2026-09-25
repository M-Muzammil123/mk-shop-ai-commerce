import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string;
  status: string;
  images: { id: string; image_url: string; is_primary: boolean }[];
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
}

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  coupon: Coupon | null;
  loading: boolean;
  couponError: string | null;
  
  fetchCart: (isAuthenticated: boolean) => Promise<void>;
  addToCart: (product: Product, quantity: number, isAuthenticated: boolean) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, isAuthenticated: boolean) => Promise<void>;
  removeFromCart: (productId: string, isAuthenticated: boolean) => Promise<void>;
  clearCart: () => void;
  
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product, isAuthenticated: boolean) => Promise<void>;
  
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  getCartTotals: () => { subtotal: number; discount: number; tax: number; shipping: number; total: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      coupon: null,
      loading: false,
      couponError: null,

      fetchCart: async (isAuthenticated) => {
        if (!isAuthenticated) return;
        set({ loading: true });
        try {
          const res = await api.get("/cart");
          set({ items: res.data.items || [], loading: false });
        } catch (e) {
          set({ loading: false });
        }
      },

      addToCart: async (product, quantity, isAuthenticated) => {
        // If authenticated, sync with server
        if (isAuthenticated) {
          set({ loading: true });
          try {
            await api.post("/cart/items", { product_id: product.id, quantity });
            const res = await api.get("/cart");
            set({ items: res.data.items || [], loading: false });
          } catch (e) {
            set({ loading: false });
          }
        } else {
          // Local storage fallback for guests
          const currentItems = get().items;
          const existingIdx = currentItems.findIndex((i) => i.product_id === product.id);
          
          let newItems = [...currentItems];
          if (existingIdx > -1) {
            newItems[existingIdx].quantity += quantity;
          } else {
            newItems.push({
              id: Math.random().toString(),
              product_id: product.id,
              quantity,
              product,
            });
          }
          set({ items: newItems });
        }
      },

      updateQuantity: async (productId, quantity, isAuthenticated) => {
        if (isAuthenticated) {
          set({ loading: true });
          try {
            await api.put(`/cart/items/${productId}`, { quantity });
            const res = await api.get("/cart");
            set({ items: res.data.items || [], loading: false });
          } catch (e) {
            set({ loading: false });
          }
        } else {
          const newItems = get().items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          );
          set({ items: newItems });
        }
      },

      removeFromCart: async (productId, isAuthenticated) => {
        if (isAuthenticated) {
          set({ loading: true });
          try {
            await api.delete(`/cart/items/${productId}`);
            const res = await api.get("/cart");
            set({ items: res.data.items || [], loading: false });
          } catch (e) {
            set({ loading: false });
          }
        } else {
          const newItems = get().items.filter((item) => item.product_id !== productId);
          set({ items: newItems });
        }
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const res = await api.get("/cart/wishlist");
          set({ wishlist: res.data || [], loading: false });
        } catch (e) {
          set({ loading: false });
        }
      },

      toggleWishlist: async (product, isAuthenticated) => {
        if (!isAuthenticated) return;
        const currentWishlist = get().wishlist;
        const exists = currentWishlist.some((w) => w.product_id === product.id);

        set({ loading: true });
        try {
          if (exists) {
            await api.delete(`/cart/wishlist/${product.id}`);
          } else {
            await api.post("/cart/wishlist", { product_id: product.id });
          }
          const res = await api.get("/cart/wishlist");
          set({ wishlist: res.data || [], loading: false });
        } catch (e) {
          set({ loading: false });
        }
      },

      applyCoupon: async (code) => {
        set({ loading: true, couponError: null });
        try {
          const res = await api.get(`/orders/coupons/${code}`);
          const couponData = res.data;
          
          // Verify min purchase amount
          const subtotal = get().getCartTotals().subtotal;
          if (subtotal < couponData.min_purchase_amount) {
            set({
              couponError: `Minimum purchase of $${couponData.min_purchase_amount} is required.`,
              loading: false
            });
            return;
          }
          
          set({ coupon: couponData, loading: false });
        } catch (err: any) {
          set({ couponError: err.message || "Invalid coupon code", loading: false });
        }
      },

      removeCoupon: () => set({ coupon: null, couponError: null }),

      getCartTotals: () => {
        const items = get().items;
        const coupon = get().coupon;
        
        let subtotal = 0;
        items.forEach((item) => {
          subtotal += item.product.price * item.quantity;
        });

        let discount = 0;
        if (coupon) {
          if (coupon.discount_type === "percentage") {
            discount = (subtotal * coupon.discount_value) / 100;
          } else {
            discount = coupon.discount_value;
          }
          discount = Math.min(discount, subtotal);
        }

        const taxableAmount = Math.max(0, subtotal - discount);
        const tax = taxableAmount * 0.08; // 8% mock tax
        const shipping = subtotal > 0 ? 10.00 : 0.00; // Flat $10 shipping
        const total = taxableAmount + tax + shipping;

        return { subtotal, discount, tax, shipping, total };
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
