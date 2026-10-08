import { create } from 'zustand';
import { DiscoveredProduct, Product } from '@/types';

export interface CompareItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  brand?: string;
  rating?: number;
  isExternal?: boolean;
  raw?: DiscoveredProduct | Product;
}

interface CompareState {
  items: CompareItem[];
  addItem: (item: CompareItem) => boolean;
  removeItem: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],

  addItem: (item: CompareItem) => {
    const { items } = get();
    if (items.some((i) => i.id === item.id)) {
      return false;
    }
    if (items.length >= 4) {
      return false; // Maximum 4 products for comparison
    }
    set({ items: [...items, item] });
    return true;
  },

  removeItem: (id: string) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  clearCompare: () => {
    set({ items: [] });
  },

  isInCompare: (id: string) => {
    return get().items.some((i) => i.id === id);
  },
}));
