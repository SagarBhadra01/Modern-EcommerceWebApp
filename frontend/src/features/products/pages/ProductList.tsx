import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/shared/ProductCard';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { products, categories } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';
import { useDebounce } from '@/hooks/useDebounce';
import { RatingStars } from '@/components/shared/RatingStars';

const ITEMS_PER_PAGE = 9;

const ProductList = () => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const debouncedSearch = useDebounce(search, 300);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (debouncedSearch) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (selectedCategories.length) {
      result = result.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [debouncedSearch, selectedCategories, minRating, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinRating(0);
    setSearch('');
    setCurrentPage(1);
  };

  const handleWishlistToggle = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filterSidebar = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
                className="h-4 w-4 rounded border-white/20 bg-black text-white focus:ring-white/30 accent-white"
              />
              <span className="text-sm text-white/40 group-hover:text-white transition-colors flex-1">
                {cat.name}
              </span>
              <span className="text-xs text-white/20 bg-white/5 px-1.5 py-0.5 rounded-full">
                {cat.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={cn(
                'flex items-center gap-2 w-full py-1 text-sm transition-colors',
                minRating === rating ? 'text-white' : 'text-white/40 hover:text-white'
              )}
            >
              <RatingStars rating={rating} />
              <span>& above</span>
            </button>
          ))}
        </div>
      </div>

      {(selectedCategories.length > 0 || minRating > 0) && (
        <button
          onClick={clearFilters}
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-24 bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6">
            {filterSidebar}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full h-10 pl-10 pr-3 bg-[#0A0A0A] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                />
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden p-2.5 rounded-xl bg-[#0A0A0A] border border-white/[0.06] text-white/40 hover:text-white transition-all"
                aria-label="Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-white/30">
                {filteredProducts.length} results
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-3 bg-[#0A0A0A] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
              <div className="hidden sm:flex items-center border border-white/[0.06] rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-black'
                      : 'text-white/40 hover:text-white'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-black'
                      : 'text-white/40 hover:text-white'
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filters */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="h-4 w-4 text-white/40" />
                  </button>
                </div>
                {filterSidebar}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))}
            </div>
          ) : (
            <>
              <motion.div
                layout
                className={cn(
                  'gap-6',
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                )}
              >
                <AnimatePresence mode="popLayout">
                  {paginatedProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                    >
                      <ProductCard
                        product={product}
                        isWishlisted={wishlist.includes(product.id)}
                        onAddToCart={(id) => {
                          const p = products.find((p) => p.id === id);
                          if (p) addItem(p);
                        }}
                        onWishlistToggle={handleWishlistToggle}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {paginatedProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg font-semibold text-white mb-2">No products found</p>
                  <p className="text-sm text-white/40 mb-4">Try adjusting your filters or search terms</p>
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-8"
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductList;
