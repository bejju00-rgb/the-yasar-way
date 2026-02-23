import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string; // Add this to keep the checkout looking premium
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((i) => i.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== id)
      })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'cart-storage' }
  )
);