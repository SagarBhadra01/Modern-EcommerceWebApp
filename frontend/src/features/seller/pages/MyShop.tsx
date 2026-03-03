import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Plus, Package, DollarSign, TrendingUp, BarChart3, Edit3, Trash2, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerService, type CreateSellerProductPayload } from '@/lib/services/seller.service';
import type { SellerProduct } from '@/types';

const MyShop = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch products and analytics from backend
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: sellerService.getProducts,
  });

  const { data: analytics } = useQuery({
    queryKey: ['seller-analytics'],
    queryFn: sellerService.getAnalytics,
  });

  const addProductMutation = useMutation({
    mutationFn: (payload: CreateSellerProductPayload) => sellerService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-analytics'] });
      setShowAddModal(false);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => sellerService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-analytics'] });
    },
  });

  const stats = [
    { label: 'Total Products', value: products.length.toString(), icon: Package, color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Total Revenue', value: formatCurrency(analytics?.totalRevenue || 0), icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Total Orders', value: (analytics?.totalOrders || 0).toString(), icon: TrendingUp, color: 'from-purple-500/20 to-purple-500/5' },
    { label: 'Active Listings', value: products.filter((p: SellerProduct) => p.status === 'active').length.toString(), icon: BarChart3, color: 'from-amber-500/20 to-amber-500/5' },
  ];

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    const activeCards = cardsRef.current.filter(Boolean);
    if (activeCards.length > 0) {
      gsap.fromTo(activeCards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [products.length]);

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addProductMutation.mutate({
      title: fd.get('title') as string,
      description: fd.get('description') as string || 'No description',
      price: parseFloat(fd.get('price') as string),
      images: [(fd.get('image') as string) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
      category: fd.get('category') as string || 'General',
      stock: parseInt(fd.get('stock') as string) || 1,
    });
  };

  return (
    <div ref={containerRef} className="opacity-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Shop</h1>
          <p className="text-sm text-white/40 mt-1">Manage your products and track sales.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#050505] border border-white/[0.08] shadow-lg rounded-2xl p-5 hover:border-white/[0.15] transition-all group">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} border border-white/10 text-white/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 text-white/30 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-[#050505] border border-white/[0.08] rounded-2xl">
          <Package className="h-8 w-8 text-white/15 mb-4" />
          <p className="text-base text-white/60 font-medium">No products yet</p>
          <p className="text-sm text-white/30 mt-1 mb-6">Add your first product to get started.</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-white text-black"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: SellerProduct, i: number) => (
            <div key={product.id} ref={(el) => { cardsRef.current[i] = el; }}
              className="bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.15] transition-all group">
              <div className="h-40 bg-white/[0.02] relative overflow-hidden">
                {product.images[0] && (
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <Badge variant={product.status === 'active' ? 'success' : 'warning'} className="absolute top-3 right-3">
                  {product.status}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1 truncate">{product.title}</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-white">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-white/30">{product.stock} in stock</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10">
                    <Edit3 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="danger"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                    className="bg-danger/10 text-danger border-danger/20 hover:bg-danger/20">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#0A0A0A] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input name="title" type="text" placeholder="Product Title" required
                className="w-full h-11 px-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
              <input name="description" type="text" placeholder="Description"
                className="w-full h-11 px-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
              <div className="grid grid-cols-2 gap-4">
                <input name="price" type="number" step="0.01" placeholder="Price" required
                  className="w-full h-11 px-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
                <input name="stock" type="number" placeholder="Stock" required
                  className="w-full h-11 px-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>
              <input name="category" type="text" placeholder="Category"
                className="w-full h-11 px-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
              <input name="image" type="text" placeholder="Image URL"
                className="w-full h-11 px-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border-white/10">Cancel</Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90" disabled={addProductMutation.isPending}>
                  {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShop;
