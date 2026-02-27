import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingCart, Minus, Plus, Shield, RotateCcw, Truck,
  ChevronRight, Star,
} from 'lucide-react';
import { cn, formatCurrency, calculateDiscount, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { ProductCard } from '@/components/shared/ProductCard';
import { products, reviews } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const tabs = ['Description', 'Specifications', 'Reviews'] as const;

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Description');
  const [wishlisted, setWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

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

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white truncate">{product.title}</span>
      </nav>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/[0.06]">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </AnimatePresence>
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant={product.badge === 'Sale' ? 'danger' : product.badge === 'Hot' ? 'warning' : 'info'}>
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'h-20 w-20 rounded-xl overflow-hidden border-2 transition-all duration-300',
                    selectedImage === i
                      ? 'border-white ring-2 ring-white/20'
                      : 'border-white/[0.06] hover:border-white/20'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{product.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={product.rating} size="md" showValue />
              <span className="text-sm text-white/30">({product.reviewCount} reviews)</span>
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
                  <Badge variant="danger">
                    -{calculateDiscount(product.price, product.originalPrice)}%
                  </Badge>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-white/40 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              product.stock > 20 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'
            )} />
            <span className="text-sm text-white/40">
              {product.stock > 20 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white">Quantity</span>
            <div className="flex items-center border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
              <Button size="lg" fullWidth onClick={handleAddToCart} leftIcon={<ShoppingCart className="h-5 w-5" />}>
                Add to Cart
              </Button>
            </motion.div>
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={() => setWishlisted(!wishlisted)}
              className={cn(
                'h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center transition-all duration-300',
                wishlisted
                  ? 'bg-danger/10 border-danger/20 text-danger'
                  : 'border-white/[0.06] text-white/40 hover:text-danger hover:border-danger/20'
              )}
              aria-label="Add to wishlist"
            >
              <Heart className={cn('h-5 w-5', wishlisted && 'fill-current')} />
            </motion.button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/[0.06]">
            {[
              { icon: <Shield className="h-4 w-4" />, label: 'Secure Checkout' },
              { icon: <RotateCcw className="h-4 w-4" />, label: 'Free Returns' },
              { icon: <Truck className="h-4 w-4" />, label: 'Fast Shipping' },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-xs text-white/30">
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-1 border-b border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 text-sm font-medium border-b-2 transition-all duration-300 relative',
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-white/40 hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="py-8"
          >
            {activeTab === 'Description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-white/40 leading-relaxed">{product.description}</p>
                <p className="text-white/40 leading-relaxed mt-4">
                  Every product in our collection is carefully selected and quality-tested to ensure it meets our premium standards. We stand behind every item with our satisfaction guarantee.
                </p>
              </div>
            )}
            {activeTab === 'Specifications' && product.specs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-white/[0.06]">
                    <span className="text-sm text-white/40">{key}</span>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="space-y-6 max-w-2xl">
                {/* Rating summary */}
                <div className="flex items-center gap-6 p-6 bg-[#0A0A0A] border border-white/[0.06] rounded-xl">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">{product.rating}</p>
                    <RatingStars rating={product.rating} className="mt-1" />
                    <p className="text-xs text-white/30 mt-1">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = productReviews.filter((r) => Math.floor(r.rating) === star).length;
                      const pct = productReviews.length ? (count / productReviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-white/30 w-3">{star}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                              className="h-full bg-yellow-400 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-white/30 w-6">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Individual reviews */}
                {productReviews.map((review) => (
                  <div key={review.id} className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center text-sm font-bold">
                        {getInitials(review.userName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{review.userName}</p>
                        <p className="text-xs text-white/30">{review.createdAt}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} />
                    <p className="text-sm text-white/40">{review.comment}</p>
                  </div>
                ))}
                {productReviews.length === 0 && (
                  <p className="text-sm text-white/30 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(id) => {
                  const prod = products.find((pr) => pr.id === id);
                  if (prod) { addItem(prod); toast.success('Added to cart'); }
                }}
                onWishlistToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductDetail;
