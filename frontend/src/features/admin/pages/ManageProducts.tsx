import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { products, categories } from '@/lib/mockData';
import type { Product } from '@/types';

const ManageProducts = () => {
  const [productList, setProductList] = useState<Product[]>(products);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = productList.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Products</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 bg-[#0A0A0A] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 px-3 bg-[#0A0A0A] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Price</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Stock</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.title} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="text-sm font-medium text-white truncate max-w-[200px]">{product.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/40">{product.category}</td>
                  <td className="py-3 px-4 text-sm font-medium text-white">{formatCurrency(product.price)}</td>
                  <td className="py-3 px-4 text-sm text-white/40">{product.stock}</td>
                  <td className="py-3 px-4">
                    <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
                      {product.stock > 0 ? 'Active' : 'Out of Stock'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all" aria-label="Edit product">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg text-white/30 hover:text-danger hover:bg-danger/5 transition-all" aria-label="Delete product">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0A0A] border-l border-white/[0.06] z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Add New Product</h2>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="h-40 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/30 text-sm cursor-pointer hover:border-white/20 hover:text-white/50 transition-all">
                    Click to upload images
                  </div>
                  <Input label="Product Name" placeholder="Enter product name" />
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Description</label>
                    <textarea
                      placeholder="Enter product description"
                      rows={3}
                      className="w-full px-3 py-2 bg-black border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Price" type="number" placeholder="0.00" />
                    <Input label="Stock" type="number" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Category</label>
                    <select className="w-full h-10 px-3 bg-black border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20">
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button fullWidth>Save Product</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageProducts;
