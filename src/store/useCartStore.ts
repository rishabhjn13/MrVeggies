import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, ProductSchema } from "@/types/database";

interface CartStore {
  items: CartItem[];
  addItem: (product: ProductSchema) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        // ✅ use product_id, not product.id
        const existingItem = items.find(
          (item) => item.id === product.product_id,
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.product_id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          const newItem: CartItem = {
            id: product.product_id, // ✅ was product.id
            name: product.product_name,
            price: Number(String(product.price).replace(/[^0-9.]/g, "")),
            quantity: 1,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage", // Key for localStorage
    },
  ),
);
