import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@/lib/services/cart.service';
import type { Product, CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;

  // Local actions (optimistic, used when not logged in too for guest cart)
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;

  // Server-synced actions
  fetchCart: () => Promise<void>;
  addItemToServer: (product: Product, quantity?: number) => Promise<void>;
  removeItemFromServer: (cartItemId: string, productId: string) => Promise<void>;
  updateQuantityOnServer: (cartItemId: string, productId: string, quantity: number) => Promise<void>;
  clearCartOnServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // ── Local-only actions (fallback / optimistic) ──────
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity }] };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // ── Server-synced actions ───────────────────────────
      fetchCart: async () => {
        try {
          set({ isLoading: true });
          const data = await cartService.getCart();
          const items: CartItem[] = data.items.map((ci) => ({
            id: ci.product.id,
            slug: ci.product.slug,
            title: ci.product.title,
            description: ci.product.description,
            price: ci.product.price,
            originalPrice: ci.product.originalPrice,
            images: ci.product.images,
            category: ci.product.category?.name || '',
            tags: ci.product.tags,
            rating: ci.product.rating,
            reviewCount: ci.product.reviewCount,
            stock: ci.product.stock,
            badge: ci.product.badge as CartItem['badge'],
            specs: ci.product.specs,
            quantity: ci.quantity,
            selectedVariant: ci.selectedVariant || undefined,
            _cartItemId: ci.id, // keep the cart item DB id for updates
          }));
          set({ items, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addItemToServer: async (product: Product, quantity = 1) => {
        // Optimistic
        get().addItem(product, quantity);
        try {
          await cartService.addItem(product.id, quantity);
          await get().fetchCart(); // Re-sync
        } catch {
          // Revert on error
          get().removeItem(product.id);
        }
      },

      removeItemFromServer: async (cartItemId: string, productId: string) => {
        const prevItems = [...get().items];
        get().removeItem(productId);
        try {
          await cartService.removeItem(cartItemId);
        } catch {
          set({ items: prevItems });
        }
      },

      updateQuantityOnServer: async (cartItemId: string, productId: string, quantity: number) => {
        const prevItems = [...get().items];
        get().updateQuantity(productId, quantity);
        try {
          await cartService.updateQuantity(cartItemId, quantity);
        } catch {
          set({ items: prevItems });
        }
      },

      clearCartOnServer: async () => {
        const prevItems = [...get().items];
        get().clearCart();
        try {
          await cartService.clearCart();
        } catch {
          set({ items: prevItems });
        }
      },
    }),
    { name: 'cart-storage' }
  )
);
