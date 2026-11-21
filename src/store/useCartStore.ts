import { create } from "zustand";
import { CartItem, ProductSchema } from "@/types/database";
import { fetchUserCart, saveUserCart } from "@/lib/cartService";

interface CartStore {
  items: CartItem[];
  userId: string | null;
  isInitialized: boolean;

  // Actions
  initializeCart: (userId: string | null) => Promise<void>;
  addItem: (
    product:
      | ProductSchema
      | {
          product_id: string;
          product_name: string;
          discounted_price: string | number;
          actual_price: string | number;
          img_link: string;
        },
  ) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const parsePrice = (
  value: string | number | null | undefined,
): number => {
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  const parsed = cleaned ? Number(cleaned) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  userId: null,
  isInitialized: false,

  // Call this when the user logs in or when the app mounts with an active auth state
  initializeCart: async (userId) => {
    if (!userId) {
      set({ items: [], userId: null, isInitialized: true });
      return;
    }

    // If already initialized for this user, don't re-fetch unnecessarily
    if (get().userId === userId && get().isInitialized) return;

    const remoteItems = await fetchUserCart(userId);
    set({ items: remoteItems, userId, isInitialized: true });
  },

  addItem: (product) => {
    const { items, userId } = get();
    const existingItem = items.find(
      (item) => item.product_id === product.product_id,
    );

    let updatedItems: CartItem[];

    if (existingItem) {
      updatedItems = items.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      const newItem: CartItem = {
        product_id: product.product_id,
        product_name: product.product_name,
        // Ensures prices are stored cleanly as strings/matching CartItem types
        discounted_price: String(product.discounted_price),
        actual_price: String(product.actual_price),
        quantity: 1,
        img_link: product.img_link,
      };
      updatedItems = [...items, newItem];
    }

    set({ items: updatedItems });

    // Sync to Firestore if user is logged in
    if (userId) {
      saveUserCart(userId, updatedItems);
    }
  },

  removeItem: (productId) => {
    const { items, userId } = get();
    const updatedItems = items.filter((item) => item.product_id !== productId);

    set({ items: updatedItems });

    if (userId) {
      saveUserCart(userId, updatedItems);
    }
  },

  updateQuantity: (productId, quantity) => {
    const { items, userId } = get();
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const updatedItems = items.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item,
    );

    set({ items: updatedItems });

    if (userId) {
      saveUserCart(userId, updatedItems);
    }
  },

  clearCart: () => {
    const { userId } = get();
    set({ items: [] });
    if (userId) {
      saveUserCart(userId, []);
    }
  },

  total: () =>
    get().items.reduce(
      (sum, item) => sum + parsePrice(item.discounted_price) * item.quantity,
      0,
    ),
}));
