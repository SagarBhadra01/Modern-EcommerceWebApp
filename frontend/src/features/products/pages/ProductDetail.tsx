import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  Heart, ShoppingCart, Minus, Plus, Shield, RotateCcw, Truck,
  ChevronRight, Star,
} from 'lucide-react';
import { cn, formatCurrency, calculateDiscount, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { ProductCard } from '@/components/shared/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { productService } from '@/lib/services/product.service';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const tabs = ['Description', 'Specifications', 'Reviews'] as const;

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: !!slug,
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Description');
  const [wishlisted, setWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const mainImgRef = useRef<HTMLImageElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const reviewBarsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Entrance animations
  useEffect(() => {
    if (!product || !containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(containerRef.current, { opacity: 0, duration: 0.4 })
        .from(galleryRef.current, { x: -30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2')
        .from(infoRef.current, { x: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    });

    return () => ctx.revert();
  }, [product]);

  // Main Image transition
  useEffect(() => {
    if (mainImgRef.current) {
      gsap.fromTo(mainImgRef.current, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [selectedImage]);

  // Tab content transition
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(tabContentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
    
    // Animate review bars if in Reviews tab
    if (activeTab === 'Reviews' && reviewBarsRef.current.length > 0) {
      reviewBarsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const width = bar.dataset.width || '0%';
        gsap.fromTo(bar, 
          { width: 0 }, 
          { width, duration: 0.8, delay: 0.2 + i * 0.1, ease: 'power3.out' }
        );
      });
    }
  }, [activeTab]);

  if (!product && isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Loading product...</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  // Use the included reviews from the backend relation
  const productReviews = product.reviews || [];

  const { data: relatedData } = useQuery({
    queryKey: ['products', 'related', product.category?.slug],
    queryFn: () => productService.getProducts({ category: product.category?.slug, limit: 4 }),
    enabled: !!product.category?.slug,
  });

  const relatedProducts = (relatedData?.products || []).filter((p: import('@/types').Product) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.title} added to cart`);
  };

  const handleButtonTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.fromTo(e.currentTarget, 
      { scale: 0.95 }, 
      { scale: 1, duration: 0.2, ease: 'back.out(2)' }
    );
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/40 mb-8 w-fit" data-hover>
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white truncate">{product.title}</span>
      </nav>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div ref={galleryRef} className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/[0.06] group cursor-zoom-in" data-hover>
            <img
              ref={mainImgRef}
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant={product.badge === 'Sale' ? 'danger' : product.badge === 'Hot' ? 'warning' : 'info'}>
                  {product.badge}
                </Badge>
              </div>
            )}
            
            {/* Subtle inset highlight */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  data-hover
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'h-20 w-20 rounded-xl overflow-hidden border transition-all duration-300 transform hover:scale-105',
                    selectedImage === i
                      ? 'border-white opacity-100 ring-2 ring-white/20'
                      : 'border-white/[0.06] opacity-60 hover:opacity-100 hover:border-white/30'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div ref={infoRef} className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">{product.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={product.rating} size="md" showValue />
              <span className="text-sm text-white/30 font-medium">({product.reviewCount} reviews)</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-white/30 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <Badge variant="danger" className="ml-2">
                    -{calculateDiscount(product.price, product.originalPrice)}%
                  </Badge>
                </>
              )}
            </div>
          </div>

          <p className="text-base text-white/60 leading-relaxed font-light">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 py-2">
            <div className={cn(
              'h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor]',
              product.stock > 20 ? 'bg-success text-success' : product.stock > 0 ? 'bg-warning text-warning' : 'bg-danger text-danger'
            )} />
            <span className="text-sm font-medium text-white/60">
              {product.stock > 20 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 py-4 border-y border-white/[0.06]">
            <span className="text-sm font-medium text-white">Quantity</span>
            <div className="flex items-center bg-[#0A0A0A] border border-white/[0.1] rounded-xl overflow-hidden p-1 shadow-inner">
              <button
                data-hover
                onClick={(e) => { handleButtonTap(e); setQuantity(Math.max(1, quantity - 1)); }}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all active:bg-white/5"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium text-white">{quantity}</span>
              <button
                data-hover
                onClick={(e) => { handleButtonTap(e); setQuantity(Math.min(product.stock, quantity + 1)); }}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all active:bg-white/5"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 pt-2">
            <div className="flex-1">
              <Button 
                size="lg" 
                fullWidth 
                onClick={(e) => { handleButtonTap(e); handleAddToCart(); }} 
                leftIcon={<ShoppingCart className="h-5 w-5" />}
                data-hover
                className="shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-shadow duration-500"
              >
                Add to Cart
              </Button>
            </div>
            <button
              onClick={(e) => { handleButtonTap(e); setWishlisted(!wishlisted); }}
              data-hover
              className={cn(
                'h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center transition-all duration-300 transform',
                wishlisted
                  ? 'bg-danger/10 border-danger/20 text-danger shadow-[0_0_15px_rgba(ef4444,0.3)]'
                  : 'bg-[#0A0A0A] border-white/[0.1] text-white/40 hover:text-danger hover:border-danger/30 hover:bg-danger/5 shadow-inner'
              )}
              aria-label="Add to wishlist"
            >
              <Heart className={cn('h-5 w-5 transition-transform duration-300', wishlisted && 'fill-current scale-110')} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 xs:gap-6 pt-6 border-t border-white/[0.06]">
            {[
              { icon: <Shield className="h-4 w-4" />, label: 'Secure Checkout' },
              { icon: <RotateCcw className="h-4 w-4" />, label: 'Free Returns' },
              { icon: <Truck className="h-4 w-4" />, label: 'Fast Shipping' },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white/80 cursor-default">
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-20">
        <div className="flex gap-8 border-b border-white/[0.06] overflow-x-auto no-scrollbar pb-[-1px]">
          {tabs.map((tab) => (
            <button
              key={tab}
              data-hover
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-4 text-sm font-medium transition-all duration-300 relative whitespace-nowrap',
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/80'
              )}
            >
              {tab}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300",
                activeTab === tab ? "opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "opacity-0"
              )} />
            </button>
          ))}
        </div>
        
        <div ref={tabContentRef} className="py-10">
          {activeTab === 'Description' && (
            <div className="prose prose-invert max-w-3xl">
              <p className="text-white/60 leading-loose text-lg font-light">{product.description}</p>
              <p className="text-white/50 leading-relaxed mt-6">
                Every product in our collection is carefully selected and quality-tested to ensure it meets our premium standards. We stand behind every item with our satisfaction guarantee.
              </p>
            </div>
          )}
          {activeTab === 'Specifications' && product.specs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 max-w-4xl">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-4 border-b border-white/[0.06] hover:bg-white/[0.02] px-2 rounded transition-colors">
                  <span className="text-sm font-medium text-white/40">{key}</span>
                  <span className="text-sm font-semibold text-white">{value as React.ReactNode}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'Reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Rating summary */}
              <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-[#050505] border border-white/[0.08] rounded-2xl shadow-xl">
                <div className="text-center w-full sm:w-auto">
                  <p className="text-6xl font-black text-white tracking-tighter">{product.rating}</p>
                  <RatingStars rating={product.rating} className="mt-2 justify-center" size="lg" />
                  <p className="text-sm font-medium text-white/40 mt-2">{product.reviewCount} total reviews</p>
                </div>
                <div className="w-px h-24 bg-white/[0.06] hidden sm:block" />
                <div className="flex-1 space-y-3 w-full">
                  {[5, 4, 3, 2, 1].map((star, i) => {
                    const count = productReviews.filter((r: import('@/types').Review) => Math.floor(r.rating) === star).length;
                    const pct = productReviews.length ? (count / productReviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4 group">
                        <span className="text-sm font-bold text-white/50 w-4">{star}</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <div className="flex-1 h-2.5 bg-[#1A1A1A] rounded-full overflow-hidden shadow-inner">
                          <div
                            ref={(el) => { if (el) reviewBarsRef.current[i] = el; }}
                            data-width={`${pct}%`}
                            className="h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(25s0,204,24,0.5)]"
                            style={{ width: '0%' }}
                          />
                        </div>
                        <span className="text-xs font-medium text-white/40 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Individual reviews */}
              <div className="space-y-4">
                {productReviews.map((review: import('@/types').Review) => (
                  <div key={review.id} className="bg-[#050505] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-4 transition-all hover:border-white/[0.12] hover:bg-[#0A0A0A]">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#333] to-[#111] border border-white/10 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                          {getInitials(review.userName)}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{review.userName}</p>
                          <p className="text-xs font-medium text-white/30">{review.createdAt}</p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed font-light">{review.comment}</p>
                  </div>
                ))}
                {productReviews.length === 0 && (
                  <div className="text-center py-12 bg-[#050505] border border-white/[0.06] rounded-2xl">
                    <p className="text-lg font-semibold text-white mb-2">No reviews yet</p>
                    <p className="text-sm text-white/40">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-white/[0.06]">
          <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p: import('@/types').Product) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(id) => {
                  const prod = relatedProducts.find((pr: import('@/types').Product) => pr.id === id);
                  if (prod) { addItem(prod); toast.success('Added to cart'); }
                }}
                onWishlistToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
