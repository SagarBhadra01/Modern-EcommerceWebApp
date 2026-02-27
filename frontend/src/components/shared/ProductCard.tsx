import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Heart, ShoppingCart, Check, Eye } from 'lucide-react';
import { cn, formatCurrency, calculateDiscount } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/shared/RatingStars';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onAddToCart: (id: string) => void;
  onWishlistToggle: (id: string) => void;
}

const ProductCard = ({
  product,
  isWishlisted = false,
  onAddToCart,
  onWishlistToggle,
}: ProductCardProps) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Spotlight position state
  const [spot, setSpot] = useState({ x: 50, y: 50 }); // percentages

  // GSAP quickSetters for 3D tilt
  const xTo = useRef<any>(null);
  const yTo = useRef<any>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    xTo.current = gsap.quickTo(cardRef.current, "rotationY", { duration: 0.5, ease: "power3" });
    yTo.current = gsap.quickTo(cardRef.current, "rotationX", { duration: 0.5, ease: "power3" });
  }, []);

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current || !xTo.current || !yTo.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;
      
      // Calculate rotation (-12 to 12 degrees)
      xTo.current((cx - 0.5) * 16);
      yTo.current(-(cy - 0.5) * 16);

      // Spotlight coordinates based on cursor
      setSpot({ x: cx * 100, y: cy * 100 });
    },
    []
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (imgRef.current) gsap.to(imgRef.current, { scale: 1.08, duration: 0.6, ease: 'power3.out' });
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
    if (actionsRef.current) gsap.to(actionsRef.current, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (xTo.current) xTo.current(0);
    if (yTo.current) yTo.current(0);
    if (imgRef.current) gsap.to(imgRef.current, { scale: 1, duration: 0.6, ease: 'power3.out' });
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
    if (actionsRef.current) gsap.to(actionsRef.current, { y: 20, opacity: 0, duration: 0.3, ease: 'power3.out' });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart(true);
    onAddToCart(product.id);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    gsap.fromTo(target, 
      { scale: 0.8 }, 
      { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" }
    );
    
    onWishlistToggle(product.id);
  };

  const badgeVariant = product.badge === 'Sale'
    ? 'danger'
    : product.badge === 'Hot'
    ? 'warning'
    : 'info';

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <Link to={`/products/${product.slug}`} className="block h-full">
        <div
          ref={cardRef}
          onMouseMove={handleMouse}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="group h-full flex flex-col relative bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] transition-colors duration-500 will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
          data-hover
        >
          {/* Spotlight overlay on hover */}
          {isHovered && (
            <div
              className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(300px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.06), transparent 70%)`
              }}
            />
          )}

          {/* Glow border inner shadow */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />

          {/* Image Container */}
          <div className="relative aspect-[4/5] w-full overflow-hidden shrink-0">
            <img
              ref={imgRef}
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover will-change-transform"
              loading="lazy"
            />

            {/* Dark overlay on hover */}
            <div
              ref={overlayRef}
              className="absolute inset-0 bg-black/40 opacity-0 will-change-opacity"
            />

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-3 left-3 z-20">
                <Badge variant={badgeVariant}>{product.badge}</Badge>
              </div>
            )}

            {/* Discount label */}
            {product.originalPrice && (
              <div className="absolute top-3 right-12 z-20">
                <Badge variant="danger">
                  -{calculateDiscount(product.price, product.originalPrice)}%
                </Badge>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-90',
                isWishlisted
                  ? 'bg-danger/20 text-danger'
                  : 'bg-black/60 backdrop-blur-sm text-white/70 hover:bg-danger/20 hover:text-danger'
              )}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              data-hover
            >
              <Heart
                className={cn('h-4 w-4 transition-transform duration-300', isWishlisted && 'fill-current scale-110')}
              />
            </button>

            {/* Quick actions on hover */}
            <div
              ref={actionsRef}
              className="absolute bottom-0 left-0 right-0 p-3 z-20 opacity-0 translate-y-5"
            >
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  data-hover
                  className={cn(
                    'flex-1 h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm transform hover:scale-[1.03] active:scale-95',
                    addedToCart
                      ? 'bg-success text-white'
                      : 'bg-white hover:bg-white/90 text-black'
                  )}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-4 w-4" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  data-hover
                  className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all transform hover:scale-110 active:scale-95 shrink-0"
                  aria-label="Quick view"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Info Container */}
          <div className="p-4 flex flex-col justify-between flex-1 relative z-10 bg-[#0A0A0A]">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-white/90 transition-colors duration-300">
                {product.title}
              </h3>

              <div className="flex items-center gap-2">
                <RatingStars rating={product.rating} />
                <span className="text-xs text-white/30">({product.reviewCount})</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-bold text-white leading-none">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-white/30 line-through leading-none">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              {/* Stock indicator */}
              <div className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0',
                product.stock > 20 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'
              )} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export { ProductCard };
export type { ProductCardProps };
