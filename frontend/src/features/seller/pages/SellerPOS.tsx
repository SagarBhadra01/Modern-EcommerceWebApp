import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Building2, CheckCircle, X, ShoppingBag } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useUser } from '@clerk/clerk-react';
import { useSellerStore } from '@/store/sellerStore';
import type { SellerProduct } from '@/types';

interface SaleItem { product: SellerProduct; quantity: number; }

const paymentMethods = [
  { value: 'card' as const, label: 'Card', icon: CreditCard },
  { value: 'cash' as const, label: 'Cash', icon: Banknote },
  { value: 'upi' as const, label: 'UPI', icon: Smartphone },
  { value: 'bank_transfer' as const, label: 'Bank', icon: Building2 },
];

const SellerPOS = () => {
  const { user } = useUser();
  const sellerId = user?.id || '';
  const { getMyProducts, addSale, getMySales } = useSellerStore();
  const myProducts = getMyProducts(sellerId);
  const mySales = getMySales(sellerId);

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'bank_transfer'>('card');
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredProducts = myProducts.filter((p) =>
    p.status === 'active' && p.title.toLowerCase().includes(search.toLowerCase())
  );
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (product: SellerProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, d: number) => {
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i).filter((i) => i.quantity > 0));
  };

  const completeSale = () => {
    if (!buyerName.trim() || !buyerEmail.trim() || cart.length === 0) return;
    cart.forEach((item) => {
      addSale({ sellerId, productId: item.product.id, productTitle: item.product.title, productImage: item.product.images[0],
        buyerName: buyerName.trim(), buyerEmail: buyerEmail.trim(), quantity: item.quantity,
        unitPrice: item.product.price, totalAmount: item.product.price * item.quantity, paymentMethod });
    });
    setShowSuccess(true); setCart([]); setBuyerName(''); setBuyerEmail('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  useEffect(() => {
    if (containerRef.current) gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }, []);

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Sell My Products</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Record a sale from your own product listings.</p>
      </div>

      {showSuccess && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-bold text-emerald-400 flex-1">Sale completed!</p>
          <button onClick={() => setShowSuccess(false)} className="p-1 text-emerald-400/40 hover:text-emerald-400"><X className="h-4 w-4" /></button>
        </div>
      )}

      {myProducts.length === 0 ? (
        <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-12 text-center">
          <ShoppingBag className="h-8 w-8 text-white/15 mx-auto mb-4" />
          <p className="text-lg text-white/60 font-medium mb-2">No products to sell</p>
          <p className="text-sm text-white/30">Add products first before recording sales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Products */}
          <div className="lg:col-span-7 bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Your Products</h2>
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-black border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                return (
                  <div key={product.id} onClick={() => addToCart(product)}
                    className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                      inCart ? 'bg-white/[0.05] border-white/[0.15]' : 'bg-black border-white/[0.06] hover:border-white/[0.12]')}>
                    <img src={product.images[0]} alt={product.title} className="h-14 w-14 rounded-lg object-cover border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{product.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">{product.category}</p>
                      <span className="text-sm font-bold text-white">{formatCurrency(product.price)}</span>
                    </div>
                    {inCart && <div className="h-7 w-7 rounded-lg bg-white text-black flex items-center justify-center text-xs font-bold shrink-0">{inCart.quantity}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart + Buyer */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Sale Cart</h2>
                <Badge variant="default">{cart.length} items</Badge>
              </div>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center py-10"><ShoppingBag className="h-6 w-6 text-white/15 mb-2" /><p className="text-sm text-white/40">Click products to add</p></div>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-[250px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 bg-black rounded-xl border border-white/[0.06]">
                        <img src={item.product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.product.title}</p>
                          <p className="text-xs text-white/40">{formatCurrency(item.product.price * item.quantity)}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => updateQty(item.product.id, -1)} className="h-7 w-7 rounded-lg bg-white/5 text-white/40 hover:text-white flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                          <span className="text-sm font-bold text-white w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.product.id, 1)} className="h-7 w-7 rounded-lg bg-white/5 text-white/40 hover:text-white flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                          <button onClick={() => setCart((p) => p.filter((i) => i.product.id !== item.product.id))} className="h-7 w-7 rounded-lg text-white/20 hover:text-danger flex items-center justify-center ml-1"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/[0.06] pt-4 flex justify-between items-center">
                    <span className="text-sm text-white/50">Total</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Buyer Info</h2>
              <div className="space-y-4">
                <Input label="Buyer Name" placeholder="Name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
                <Input label="Buyer Email" type="email" placeholder="Email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Payment</label>
                  <div className="grid grid-cols-4 gap-2">
                    {paymentMethods.map((m) => (
                      <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                        className={cn('flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                          paymentMethod === m.value ? 'bg-white/10 border-white/20 text-white' : 'border-white/[0.06] text-white/30 hover:text-white/60')}>
                        <m.icon className="h-4 w-4" />{m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button fullWidth size="lg" onClick={completeSale} disabled={cart.length === 0 || !buyerName.trim() || !buyerEmail.trim()} className="mt-2">
                  Complete Sale — {formatCurrency(cartTotal)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mySales.length > 0 && (
        <div className="mt-8 bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/[0.06]"><h2 className="text-lg font-bold text-white">My Recent Sales</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase">Product</th>
                <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase">Buyer</th>
                <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase">Total</th>
                <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase">Status</th>
              </tr></thead>
              <tbody>
                {mySales.slice(0, 8).map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-3 px-5 text-xs font-bold text-white">{s.productTitle}</td>
                    <td className="py-3 px-5 text-xs text-white/60">{s.buyerName}</td>
                    <td className="py-3 px-5 text-xs font-bold text-white">{formatCurrency(s.totalAmount)}</td>
                    <td className="py-3 px-5"><Badge variant="success" className="text-[10px]">{s.status}</Badge></td>
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

export default SellerPOS;
