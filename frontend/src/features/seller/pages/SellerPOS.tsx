import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShoppingCart, CreditCard, Wallet, Building2, Loader2, Search, Package } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerService, type RecordSalePayload } from '@/lib/services/seller.service';
import type { SellerProduct } from '@/types';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: Wallet },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: ShoppingCart },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
] as const;

const SellerPOS = () => {
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<RecordSalePayload['paymentMethod']>('cash');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const containerRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: sellerService.getProducts,
  });

  const recordSaleMutation = useMutation({
    mutationFn: (payload: RecordSalePayload) => sellerService.recordSale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-analytics'] });
      toast.success('Sale recorded successfully!');
      setSelectedProduct(null);
      setQuantity(1);
      setBuyerName('');
      setBuyerEmail('');
    },
    onError: () => {
      toast.error('Failed to record sale');
    },
  });

  const activeProducts = products.filter((p: SellerProduct) => p.status === 'active' && p.stock > 0);
  const filteredProducts = activeProducts.filter((p: SellerProduct) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSale = () => {
    if (!selectedProduct || !buyerName || !buyerEmail) return;
    recordSaleMutation.mutate({
      productId: selectedProduct.id,
      buyerName,
      buyerEmail,
      quantity,
      unitPrice: selectedProduct.price,
      paymentMethod,
    });
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Point of Sale</h1>
        <p className="text-sm text-white/40 mt-1">Record direct sales for your products.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-3">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-white/30 animate-spin" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-[#050505] border border-white/[0.08] rounded-2xl text-center">
              <Package className="h-8 w-8 text-white/15 mb-4" />
              <p className="text-base text-white/60 font-medium">No products available</p>
              <p className="text-sm text-white/30 mt-1">Add products from My Shop first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((product: SellerProduct) => (
                <button key={product.id} onClick={() => { setSelectedProduct(product); setQuantity(1); }}
                  className={cn(
                    'text-left bg-[#050505] border rounded-xl p-4 transition-all hover:bg-white/[0.03] group',
                    selectedProduct?.id === product.id ? 'border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/[0.08] hover:border-white/[0.15]'
                  )}>
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <img src={product.images[0]} alt={product.title} className="h-12 w-12 rounded-lg object-cover border border-white/10" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{product.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-white/80">{formatCurrency(product.price)}</span>
                        <span className="text-[10px] text-white/30">{product.stock} in stock</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sale Form */}
        <div className="lg:col-span-2 bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl h-fit sticky top-24">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Record Sale</h2>

          {!selectedProduct ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-8 w-8 text-white/15 mx-auto mb-4" />
              <p className="text-sm text-white/40">Select a product to begin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected product */}
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                <p className="text-sm font-bold text-white">{selectedProduct.title}</p>
                <p className="text-lg font-bold text-white mt-1">{formatCurrency(selectedProduct.price)}</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-lg font-bold">−</button>
                  <span className="text-lg font-bold text-white w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-lg font-bold">+</button>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="space-y-3">
                <input type="text" placeholder="Buyer Name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required
                  className="w-full h-11 px-4 bg-[#0A0A0A] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
                <input type="email" placeholder="Buyer Email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required
                  className="w-full h-11 px-4 bg-[#0A0A0A] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((pm) => (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border',
                        paymentMethod === pm.id ? 'bg-white text-black border-white' : 'bg-white/5 text-white/50 border-white/[0.08] hover:bg-white/10'
                      )}>
                      <pm.icon className="h-3.5 w-3.5" /> {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-white/[0.08] pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-white/40">Total</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(selectedProduct.price * quantity)}</span>
                </div>
                <Button onClick={handleSale} className="w-full bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  disabled={!buyerName || !buyerEmail || recordSaleMutation.isPending}>
                  {recordSaleMutation.isPending ? 'Processing...' : 'Record Sale'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerPOS;
