import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Building2, CheckCircle, X, ShoppingBag } from 'lucide-react';
import { cn, formatCurrency, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAdminStore } from '@/store/adminStore';
import type { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/lib/services/product.service';

interface SaleItem {
  product: Product;
  quantity: number;
}

const paymentMethods = [
  { value: 'card' as const, label: 'Card', icon: CreditCard },
  { value: 'cash' as const, label: 'Cash', icon: Banknote },
  { value: 'upi' as const, label: 'UPI', icon: Smartphone },
  { value: 'bank_transfer' as const, label: 'Bank', icon: Building2 },
];

const SellProducts = () => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'bank_transfer'>('card');
  const [showSuccess, setShowSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const { addSale, sales } = useAdminStore();

  const { data: productData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });
  
  const products = productData?.products || [];

  const filteredProducts = products.filter((p: Product) => {
    const titleMatch = p.title.toLowerCase().includes(search.toLowerCase());
    const catNameMatch = typeof p.category === 'string' 
      ? p.category.toLowerCase().includes(search.toLowerCase()) 
      : (p.category as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const catIdMatch = p.id?.toLowerCase().includes(search.toLowerCase());
    return titleMatch || catNameMatch || catIdMatch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const completeSale = () => {
    if (!buyerName.trim() || !buyerEmail.trim() || cart.length === 0) return;

    // Record each cart item as a sale
    cart.forEach((item) => {
      addSale({
        productId: item.product.id,
        productTitle: item.product.title,
        productImage: item.product.images[0],
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalAmount: item.product.price * item.quantity,
        paymentMethod,
      });
    });

    // Show success
    setShowSuccess(true);

    // Reset form
    setTimeout(() => {
      setCart([]);
      setBuyerName('');
      setBuyerEmail('');
      setPaymentMethod('card');
    }, 100);

    // Auto-hide success after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  // Success animation
  useEffect(() => {
    if (showSuccess && successRef.current) {
      gsap.fromTo(successRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }
  }, [showSuccess]);

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Sell Products</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Create a new sale by selecting products and entering buyer information.</p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div ref={successRef} className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-400">Sale completed successfully!</p>
            <p className="text-xs text-emerald-400/60 mt-0.5">The transaction has been recorded.</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="p-1 text-emerald-400/40 hover:text-emerald-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Picker */}
        <div className="lg:col-span-7">
          <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Select Products</h2>
            
            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-black border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 shadow-inner transition-all"
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {filteredProducts.map((product: Product) => {
                const inCart = cart.find((item) => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer group',
                      inCart
                        ? 'bg-white/[0.05] border-white/[0.15]'
                        : 'bg-black border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'
                    )}
                    onClick={() => addToCart(product)}
                  >
                    <img src={product.images[0]} alt={product.title} className="h-14 w-14 rounded-lg object-cover border border-white/10 group-hover:scale-105 transition-transform shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{product.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">{typeof product.category === 'object' ? (product.category as any).name : product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-white">{formatCurrency(product.price)}</span>
                        {product.stock < 10 && (
                          <Badge variant="warning" className="text-[9px]">{product.stock} left</Badge>
                        )}
                      </div>
                    </div>
                    {inCart && (
                      <div className="h-7 w-7 rounded-lg bg-white text-black flex items-center justify-center text-xs font-bold shrink-0">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sale Cart & Buyer Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cart */}
          <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Sale Cart</h2>
              <Badge variant="default">{cart.length} items</Badge>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-14 w-14 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-3">
                  <ShoppingBag className="h-6 w-6 text-white/15" />
                </div>
                <p className="text-sm text-white/40">No products added yet</p>
                <p className="text-xs text-white/20 mt-1">Click products to add them</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4 max-h-[280px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 bg-black rounded-xl border border-white/[0.06]">
                    <img src={item.product.images[0]} alt={item.product.title} className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.product.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="h-7 w-7 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-bold text-white w-7 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="h-7 w-7 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="h-7 w-7 rounded-lg text-white/20 hover:text-danger hover:bg-danger/10 flex items-center justify-center transition-colors ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/50">Total</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Buyer Info */}
          <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Buyer Information</h2>
            <div className="space-y-4">
              <Input
                label="Buyer Name"
                placeholder="Enter buyer name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
              <Input
                label="Buyer Email"
                type="email"
                placeholder="Enter buyer email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
              />

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all duration-300',
                        paymentMethod === method.value
                          ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                          : 'border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/10 hover:bg-white/[0.02]'
                      )}
                    >
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={completeSale}
                disabled={cart.length === 0 || !buyerName.trim() || !buyerEmail.trim()}
                className="shadow-[0_0_25px_rgba(255,255,255,0.1)] mt-2"
              >
                Complete Sale — {formatCurrency(cartTotal)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div className="mt-8 bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/[0.06]">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Sales</h2>
            <p className="text-xs text-white/30 mt-1">Sales recorded in this session</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Sale ID</th>
                  <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Product</th>
                  <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Buyer</th>
                  <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Qty</th>
                  <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Total</th>
                  <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-xs font-mono text-white/70">{sale.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img src={sale.productImage} alt={sale.productTitle} className="h-8 w-8 rounded-lg object-cover border border-white/10" />
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{sale.productTitle}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-xs font-medium text-white/80">{sale.buyerName}</p>
                      <p className="text-[10px] text-white/30">{sale.buyerEmail}</p>
                    </td>
                    <td className="py-3 px-5 text-xs font-medium text-white/60">{sale.quantity}</td>
                    <td className="py-3 px-5 text-xs font-bold text-white">{formatCurrency(sale.totalAmount)}</td>
                    <td className="py-3 px-5">
                      <Badge variant="info" className="text-[10px] uppercase">{sale.paymentMethod.replace('_', ' ')}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellProducts;
