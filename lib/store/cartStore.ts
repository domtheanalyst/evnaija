"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, UtilityProduct } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (product: UtilityProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          const item: CartItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            emoji: product.emoji,
            quantity,
            vendor: product.vendor,
          };
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "evnaija-cart" },
  ),
);