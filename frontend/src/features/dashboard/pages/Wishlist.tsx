import { useState } from 'react';
import { Heart } from 'lucide-react';
import { ProductCard } from '@/components/shared/ProductCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { products } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';

const Wishlist = () => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(['1', '3', '5', '7']);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleRemove = (id: string) => {
    setWishlistIds((prev) => prev.filter((i) => i !== id));
  };

  if (wishlistProducts.length === 0) {
    return (
      <div>
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
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Wishlist ({wishlistProducts.length} items)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={true}
            onAddToCart={(id) => {
              const p = products.find((p) => p.id === id);
              if (p) addItem(p);
            }}
            onWishlistToggle={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
