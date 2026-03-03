import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { formatCurrency, generateId, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/lib/services/category.service';
import { productService } from '@/lib/services/product.service';
import type { Product } from '@/types';

const ManageProducts = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const { data: productData, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });
  
  const productList = productData?.products || [];

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formError, setFormError] = useState('');

  // Update initial category once loaded
  useEffect(() => {
    if (categories.length > 0 && !formCategory) {
      setFormCategory(categories[0].name);
    }
  }, [categories, formCategory]);

  // GSAP Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const filtered = productList.filter((p: Product) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || String(p.category) === filterCategory || p.id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (slug: string) => {
    // Optimistic delete or calling backend would go here if we set up delete route
    // API mock - normally we'd do a delete method
    console.log("Delete product via API", slug);
    refetch();
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStock('');
    setFormCategory(categories[0]?.name || '');
    setFormError('');
    setEditingProduct(null);
  };

  const openDrawer = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.title);
      setFormDescription(product.description);
      setFormPrice(product.price.toString());
      setFormOriginalPrice(product.originalPrice?.toString() || '');
      setFormStock(product.stock.toString());
      setFormCategory(String(product.category) || '');
    } else {
      resetForm();
    }
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formName.trim()) { setFormError('Product name is required'); return; }
    if (!formPrice || parseFloat(formPrice) <= 0) { setFormError('Valid price is required'); return; }
    if (!formStock || parseInt(formStock) < 0) { setFormError('Valid stock quantity is required'); return; }
    setFormError('');

    const productPayload = {
      title: formName.trim(),
      description: formDescription.trim() || 'No description provided.',
      price: parseFloat(formPrice),
      originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : undefined,
      stock: parseInt(formStock),
      categoryId: categories.find((c: any) => c.name === formCategory)?.id || '',
    };

    if (editingProduct) {
      // Update via API
       console.log('Update product in API:', editingProduct.slug, productPayload);
    } else {
      // Create via API
       console.log('Create product in API:', productPayload);
    }
    
    // Refresh list from DB
    await refetch();
    closeDrawer();
  };

  // Initial page entrance
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  // Row animation on filter change
  useEffect(() => {
    const activeRows = rowsRef.current.filter(Boolean);
    if (activeRows.length > 0) {
      gsap.fromTo(activeRows,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [search, filterCategory, filtered.length]);

  // Drawer Animation logic
  useEffect(() => {
    if (drawerOpen) {
      if (overlayRef.current && drawerRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(drawerRef.current, { x: '100%' }, { x: 0, duration: 0.4, ease: 'power3.out' });
      }
    }
  }, [drawerOpen]);

  const closeDrawer = () => {
    if (overlayRef.current && drawerRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(drawerRef.current, { 
        x: '100%', 
        duration: 0.4, 
        ease: 'power3.in',
        onComplete: () => { setDrawerOpen(false); resetForm(); }
      });
    } else {
      setDrawerOpen(false);
      resetForm();
    }
  };

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manage Products</h1>
          <p className="text-xs text-white/30 mt-1">{productList.length} products total</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openDrawer()} className="shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 shadow-inner group-hover:border-white/20 transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-11 px-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 shadow-inner appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23666666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]"
        >
          <option value="">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Product</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Category</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Price</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Stock</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product: Product, i: number) => (
                <tr key={product.id} ref={(el) => { rowsRef.current[i] = el; }} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-4">
                      <img src={product.images[0]} alt={product.title} className="h-12 w-12 rounded-lg object-cover border border-white/10" />
                      <span className="text-sm font-bold text-white truncate max-w-[200px] group-hover:text-white/90">{product.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm font-medium text-white/50">{typeof product.category === 'object' ? (product.category as any).name : product.category}</td>
                  <td className="py-4 px-5 text-sm font-bold text-white">{formatCurrency(product.price)}</td>
                  <td className="py-4 px-5 text-sm font-medium text-white/60">{product.stock}</td>
                  <td className="py-4 px-5">
                    <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
                      {product.stock > 0 ? 'Active' : 'Out of Stock'}
                    </Badge>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDrawer(product)}
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                        aria-label="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg text-white/30 hover:text-danger hover:bg-danger/10 transition-all border border-transparent hover:border-danger/10" aria-label="Delete product">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
              <span className="text-white/20 text-2xl">📦</span>
            </div>
            <p className="text-base text-white/60 font-medium">No products found.</p>
            <p className="text-sm text-white/30 mt-1">Try changing your filters or add a new product.</p>
          </div>
        )}
      </div>

      {/* Slide-in Drawer via GSAP */}
      <div 
        className={`fixed inset-0 z-40 ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none hidden'}`}
      >
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0"
          onClick={closeDrawer}
        />
        <div
          ref={drawerRef}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-[#050505] border-l border-white/[0.08] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 overflow-y-auto translate-x-full"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeDrawer} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
                {formError}
              </div>
            )}

            <div className="space-y-6">
              <div className="border border-white/[0.08] bg-black p-4 rounded-xl">
                <div className="h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/30 cursor-pointer hover:border-white/40 hover:text-white/60 hover:bg-white/[0.02] transition-all">
                  <Plus className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Click to upload images</span>
                  <span className="text-xs text-white/20 mt-1">A default image will be used</span>
                </div>
              </div>

              <Input
                label="Product Name"
                placeholder="Enter product name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  placeholder="Enter product description"
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  placeholder="0.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
                <Input
                  label="Original Price"
                  type="number"
                  placeholder="Optional"
                  value={formOriginalPrice}
                  onChange={(e) => setFormOriginalPrice(e.target.value)}
                />
              </div>

              <Input
                label="Stock"
                type="number"
                placeholder="0"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
              />

              <div>
                <label className="block text-sm font-bold text-white mb-2">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-11 px-4 bg-black border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 shadow-inner appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23666666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleSave}
                  className="shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
