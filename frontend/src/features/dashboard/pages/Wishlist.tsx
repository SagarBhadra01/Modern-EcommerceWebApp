import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Heart } from 'lucide-react';
import { ProductCard } from '@/components/shared/ProductCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { products } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';

const Wishlist = () => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(['1', '3', '5', '7']);
  const addItem = useCartStore((s) => s.addItem);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
    
    if (gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, []);

  const handleRemove = (id: string, element?: HTMLElement) => {
    if (element) {
      gsap.to(element, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setWishlistIds((prev) => prev.filter((i) => i !== id));
        }
      });
    } else {
      setWishlistIds((prev) => prev.filter((i) => i !== id));
    }
  };

  if (wishlistProducts.length === 0) {
    return (
      <div ref={containerRef} className="opacity-0">
        <h1 className="text-2xl font-bold text-white mb-6">My Wishlist</h1>
        <EmptyState
          icon={<Heart className="h-16 w-16" />}
          title="Your wishlist is empty"
          description="Save items you love to your wishlist and come back to them later."
          actionLabel="Browse Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="opacity-0">
      <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">My Wishlist ({wishlistProducts.length} items)</h1>
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistProducts.map((product) => (
          <div key={product.id} className="opacity-0">
            <ProductCard
              product={product}
              isWishlisted={true}
              onAddToCart={(id) => {
                const p = products.find((p) => p.id === id);
                if (p) addItem(p);
              }}
              onWishlistToggle={(id) => {
                const el = document.getElementById(`wishlist-item-${id}`);
                handleRemove(id, el?.parentElement || undefined);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
