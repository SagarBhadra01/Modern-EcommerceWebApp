import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';
import { toast } from 'sonner';

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } =
    useCartStore();

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product, quantity);
    toast.success(`${product.title} added to cart`);
  };

  const handleRemoveFromCart = (id: string) => {
    removeItem(id);
    toast.success('Item removed from cart');
  };

  return {
    items,
    addItem: handleAddToCart,
    removeItem: handleRemoveFromCart,
    updateQuantity,
    clearCart,
    total: getTotal(),
    itemCount: getItemCount(),
  };
}
