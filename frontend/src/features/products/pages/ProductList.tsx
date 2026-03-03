import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/shared/ProductCard';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { categoryService } from '@/lib/services/category.service';
import { productService } from '@/lib/services/product.service';
import { useCartStore } from '@/store/cartStore';
import { useDebounce } from '@/hooks/useDebounce';
import { RatingStars } from '@/components/shared/RatingStars';
import { wishlistService } from '@/lib/services/wishlist.service';
import { useUser } from '@clerk/clerk-react';

gsap.registerPlugin(ScrollTrigger);

const ITEMS_PER_PAGE = 9;

const ProductList = () => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const debouncedSearch = useDebounce(search, 300);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['products', currentPage, debouncedSearch, selectedCategories, minRating, sortBy],
    queryFn: () => productService.getProducts({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch || undefined,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined, // Only single category supported by API for now
      sort: sortBy as any,
    }),
  });

  const paginatedProducts = data?.products || [];
  const totalPages = data?.pagination?.pages || 0;
  const totalItems = data?.pagination?.total || 0;

  // Page Entrance GSAP
  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }
  }, []);

  // Grid Stagger GSAP on list change
  useEffect(() => {
    if (!gridRef.current || loading) return;
    const cards = Array.from(gridRef.current.children);
    if (cards.length) {
      gsap.killTweensOf(cards);
      gsap.fromTo(cards, 
        { opacity: 0, y: 40, rotationX: 10 }, 
        { 
          opacity: 1, 
          y: 0, 
          rotationX: 0,
          duration: 0.6, 
          stagger: 0.05, 
          ease: 'back.out(1.2)' 
        }
      );
    }
  }, [paginatedProducts, viewMode, loading]);

  // Mobile filters animate in/out
  useEffect(() => {
    if (!mobileFiltersRef.current) return;
    if (showMobileFilters) {
      gsap.fromTo(mobileFiltersRef.current, 
        { height: 0, opacity: 0 }, 
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    } else {
      gsap.to(mobileFiltersRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.in' });
    }
  }, [showMobileFilters]);

  const toggleCategory = (catSlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catSlug) ? prev.filter((c) => c !== catSlug) : [...prev, catSlug]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinRating(0);
    setSearch('');
    setCurrentPage(1);
  };

  const queryClient = useQueryClient();

  // Wishlist Logic
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
    enabled: isLoaded && !!userId,
  });
  const wishlist = typeof wishlistData === 'object' && wishlistData !== null 
                     ? (wishlistData as any[]).map(item => item.product?.id || item.productId) 
                     : [];

  const toggleWishlistMutation = useMutation({
    mutationFn: (productId: string) => {
      const isWishlisted = wishlist.includes(productId);
      return isWishlisted ? wishlistService.removeFromWishlist(productId) : wishlistService.addToWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleWishlistToggle = (id: string) => {
    if (!userId) return; // Ignore if guest
    toggleWishlistMutation.mutate(id);
  };

  const filterSidebar = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group hover:bg-[#1A1A1A] p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="h-4 w-4 rounded border-[#333] bg-black text-white focus:ring-white/30 accent-white transition-all cursor-pointer"
              />
              <span className="text-sm text-white/60 group-hover:text-white transition-colors flex-1">
                {cat.name}
              </span>
              <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full font-medium">
                {cat.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] w-full my-4" />

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={cn(
                'flex items-center gap-2 w-full p-2 rounded-lg text-sm transition-all duration-300',
                minRating === rating 
                  ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]' 
                  : 'text-white/40 hover:text-white hover:bg-[#1A1A1A]'
              )}
            >
              <RatingStars rating={rating} />
              <span className="font-medium">& above</span>
            </button>
          ))}
        </div>
      </div>

      {(selectedCategories.length > 0 || minRating > 0) && (
        <button
          onClick={clearFilters}
          className="w-full mt-4 bg-danger/10 hover:bg-danger/20 text-danger text-sm font-medium py-2 rounded-lg transition-colors border border-danger/20"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div
      ref={pageRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 opacity-0"
    >
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0" style={{ perspective: 1000 }}>
          <div ref={sidebarRef} className="sticky top-24 bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
            {filterSidebar}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-[#050505] border border-white/[0.08] p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search globally..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full h-10 pl-10 pr-3 bg-black border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all shadow-inner"
                />
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden p-2.5 rounded-xl bg-black border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/5 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                aria-label="Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <span className="text-sm font-medium text-white/40 bg-white/5 px-3 py-1 rounded-full">
                {totalItems} results
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 bg-black border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer shadow-inner appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_10px_center] bg-no-repeat"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <div className="hidden sm:flex items-center bg-black border border-white/[0.1] rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'grid'
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'list'
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filters (controlled by GSAP) */}
          <div
            ref={mobileFiltersRef}
            className="lg:hidden overflow-hidden h-0 opacity-0 bg-[#050505] border-x border-b border-t-0 border-white/[0.08] rounded-b-2xl p-0 -mt-8 mb-8 shadow-xl relative z-10"
            style={{ display: showMobileFilters ? 'block' : 'none' }}
          >
            <div className="p-6 pt-10">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.06]">
                <h3 className="font-bold text-white tracking-wide">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              {filterSidebar}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))}
            </div>
          ) : (
            <>
              <div
                ref={gridRef}
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-6'
                )}
                style={{ perspective: 1200 }}
              >
                {paginatedProducts.map((product: import('@/types').Product) => (
                  <div key={product.id} className="will-change-transform">
                    <ProductCard
                      product={product}
                      isWishlisted={wishlist.includes(product.id)}
                      onAddToCart={(id) => {
                        const p = paginatedProducts.find((p: import('@/types').Product) => p.id === id);
                        if (p) addItem(p);
                      }}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  </div>
                ))}
              </div>

              {paginatedProducts.length === 0 && (
                <div className="text-center py-20 bg-[#050505] border border-white/[0.08] rounded-2xl mt-8">
                  <p className="text-lg font-bold text-white mb-2 tracking-wide">No products found</p>
                  <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                  <Button onClick={clearFilters} variant="secondary" className="px-8">
                    Clear All Filters
                  </Button>
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-12"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
