import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCartStore } from '@/store/cartStore';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const total = getTotal();
  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-16 w-16" />}
          title="Your cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          actionLabel="Browse Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-2xl font-bold text-white mb-8">Shopping Cart ({getItemCount()} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Items */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-4 flex gap-4"
              >
                <Link to={`/products/${item.slug}`}>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-20 w-20 rounded-lg object-cover shrink-0"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${item.slug}`}>
                        <h3 className="text-sm font-medium text-white hover:text-white/70 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-white/30 mt-0.5">{item.category}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-lg text-white/30 hover:text-danger hover:bg-danger/5 transition-all"
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-white/[0.06] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 sticky top-24 space-y-4">
            <h2 className="text-lg font-semibold text-white">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Shipping</span>
                <span className={cn('text-white', shipping === 0 && 'text-success')}>
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Tax</span>
                <span className="text-white">{formatCurrency(tax)}</span>
              </div>
              <hr className="border-white/[0.06]" />
              <div className="flex justify-between">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Promo */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="text"
                  placeholder="Promo code"
                  className="w-full h-10 pl-10 pr-3 bg-black border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <Button variant="secondary" size="md">Apply</Button>
            </div>

            <Link to="/checkout">
              <Button fullWidth size="lg" className="mt-2">
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              to="/products"
              className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white transition-colors mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
