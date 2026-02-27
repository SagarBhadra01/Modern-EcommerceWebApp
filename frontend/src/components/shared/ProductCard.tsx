import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt on hover
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  // Spotlight position
  const spotX = useMotionValue(0.5);
  const spotY = useMotionValue(0.5);

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;
      rotateY.set((cx - 0.5) * 12);
      rotateX.set(-(cy - 0.5) * 12);
      spotX.set(cx);
      spotY.set(cy);
    },
    [rotateX, rotateY, spotX, spotY]
  );

  const resetTilt = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  }, [rotateX, rotateY]);

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
    onWishlistToggle(product.id);
  };

  const badgeVariant = product.badge === 'Sale'
    ? 'danger'
    : product.badge === 'Hot'
    ? 'warning'
    : 'info';

  return (
    <Link to={`/products/${product.slug}`}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={resetTilt}
        style={{
          rotateX: springRX,
          rotateY: springRY,
          transformPerspective: 800,
        }}
        className="group relative bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] transition-all duration-500"
      >
        {/* Spotlight overlay on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: `radial-gradient(300px circle at ${spotX.get() * 100}% ${spotY.get() * 100}%, rgba(255,255,255,0.06), transparent 70%)`,
            }}
          />
        )}

        {/* Glow border */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />

        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            loading="lazy"
          />

          {/* Dark overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Badge */}
          {product.badge && (
            <motion.div
              className="absolute top-3 left-3 z-20"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant={badgeVariant}>{product.badge}</Badge>
            </motion.div>
          )}

          {/* Discount label */}
          {product.originalPrice && (
            <div className="absolute top-3 right-12 z-20">
              <Badge variant="danger">
                -{calculateDiscount(product.price, product.originalPrice)}%
              </Badge>
            </div>
          )}

          {/* Wishlist */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 1.4 }}
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-300',
              isWishlisted
                ? 'bg-danger/20 text-danger'
                : 'bg-black/60 backdrop-blur-sm text-white/70 hover:bg-danger/20 hover:text-danger'
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn('h-4 w-4', isWishlisted && 'fill-current')}
            />
          </motion.button>

          {/* Quick actions on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-3 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={cn(
                  'flex-1 h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm',
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
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="Quick view"
              >
                <Eye className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2 relative z-10">
          <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-white/90 transition-colors duration-300">
            {product.title}
          </h3>

          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-white/30">({product.reviewCount})</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-white/30 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            {/* Stock indicator */}
            <div className={cn(
              'h-1.5 w-1.5 rounded-full',
              product.stock > 20 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'
            )} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export { ProductCard };
export type { ProductCardProps };
