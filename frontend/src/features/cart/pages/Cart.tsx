import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
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

  const pageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current || items.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      
      if (listRef.current && listRef.current.children.length > 0) {
        gsap.fromTo(listRef.current.children, 
          { opacity: 0, x: -20 }, 
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
      }
      
      if (summaryRef.current) {
        gsap.fromTo(summaryRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' });
      }
    });

    return () => ctx.revert();
  }, [items.length]);

  const handleRemove = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const itemEl = e.currentTarget.closest('.cart-item') as HTMLElement;
    if (itemEl) {
      gsap.to(itemEl, { 
        opacity: 0, 
        x: -50, 
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3, 
        onComplete: () => removeItem(id) 
      });
    } else {
      removeItem(id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-20 py-16">
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
    <div
      ref={pageRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 opacity-0"
    >
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Shopping Cart</h1>
        <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm font-medium">
          {getItemCount()} items
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Items */}
        <div ref={listRef} className="lg:col-span-3 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="cart-item bg-[#050505] border border-white/[0.08] rounded-2xl p-4 flex gap-4 transition-colors hover:border-white/[0.12] overflow-hidden shadow-lg"
            >
              <Link to={`/products/${item.slug}`} className="shrink-0" data-hover>
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0A0A0A]">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/products/${item.slug}`} data-hover>
                      <h3 className="text-sm sm:text-base font-medium text-white hover:text-white/80 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <button
                      onClick={(e) => handleRemove(item.id, e)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-danger hover:bg-danger/10 transition-colors"
                      aria-label="Remove item"
                      data-hover
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-white/40 mt-1">{item.category}</p>
                </div>
                
                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-center bg-black border border-white/[0.1] rounded-lg overflow-hidden shadow-inner p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div ref={summaryRef} className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 sm:p-8 sticky top-24 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Order Summary</h2>

            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Shipping</span>
                <span className={cn(shipping === 0 ? 'text-success bg-success/10 px-2 py-0.5 rounded-md' : 'text-white')}>
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Tax</span>
                <span className="text-white">{formatCurrency(tax)}</span>
              </div>
              
              <div className="h-px bg-white/[0.08] w-full my-4" />
              
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-3xl font-black text-white tracking-tighter">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Promo */}
            <div className="flex gap-2 mt-8">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Promo code"
                  className="w-full h-11 pl-10 pr-3 bg-black border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-inner"
                />
              </div>
              <Button variant="secondary" size="md" className="h-11 px-6">Apply</Button>
            </div>

            <Link to="/checkout" className="block mt-6" data-hover>
              <Button fullWidth size="lg" className="shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              to="/products"
              data-hover
              className="flex items-center justify-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors mt-6 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
