import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, slugify } from '@/lib/utils';
import type { SellerProduct, SellerSale } from '@/types';

interface SellerStore {
  products: SellerProduct[];
  sales: SellerSale[];

  // Product actions
  addProduct: (product: Omit<SellerProduct, 'id' | 'slug' | 'createdAt' | 'status'>) => void;
  updateProduct: (id: string, updates: Partial<SellerProduct>) => void;
  deleteProduct: (id: string) => void;
  getMyProducts: (sellerId: string) => SellerProduct[];

  // Sale actions
  addSale: (sale: Omit<SellerSale, 'id' | 'date' | 'status'>) => void;
  getMySales: (sellerId: string) => SellerSale[];
  getMyRevenue: (sellerId: string) => number;
  getMyTopProducts: (sellerId: string) => { productId: string; title: string; image: string; unitsSold: number; revenue: number }[];
  getMyRecentBuyers: (sellerId: string) => SellerSale[];
}

export const useSellerStore = create<SellerStore>()(
  persist(
    (set, get) => ({
      products: [],
      sales: [],

      addProduct: (product) => {
        const newProduct: SellerProduct = {
          ...product,
          id: `SPROD-${generateId()}`,
          slug: slugify(product.title),
          status: product.stock > 0 ? 'active' : 'draft',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [newProduct, ...state.products] }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, slug: updates.title ? slugify(updates.title) : p.slug } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },

      getMyProducts: (sellerId) => {
        return get().products.filter((p) => p.sellerId === sellerId);
      },

      addSale: (sale) => {
        const newSale: SellerSale = {
          ...sale,
          id: `SSALE-${generateId()}`,
          status: 'completed',
          date: new Date().toISOString(),
        };
        set((state) => ({ sales: [newSale, ...state.sales] }));

        // Decrease stock
        const product = get().products.find((p) => p.id === sale.productId);
        if (product) {
          const newStock = Math.max(0, product.stock - sale.quantity);
          get().updateProduct(product.id, {
            stock: newStock,
            status: newStock === 0 ? 'sold_out' : 'active',
          });
        }
      },

      getMySales: (sellerId) => {
        return get().sales.filter((s) => s.sellerId === sellerId);
      },

      getMyRevenue: (sellerId) => {
        return get().sales
          .filter((s) => s.sellerId === sellerId && s.status === 'completed')
          .reduce((sum, s) => sum + s.totalAmount, 0);
      },

      getMyTopProducts: (sellerId) => {
        const mySales = get().sales.filter((s) => s.sellerId === sellerId);
        const productMap = new Map<string, { productId: string; title: string; image: string; unitsSold: number; revenue: number }>();

        mySales.forEach((sale) => {
          const existing = productMap.get(sale.productId);
          if (existing) {
            existing.unitsSold += sale.quantity;
            existing.revenue += sale.totalAmount;
          } else {
            productMap.set(sale.productId, {
              productId: sale.productId,
              title: sale.productTitle,
              image: sale.productImage,
              unitsSold: sale.quantity,
              revenue: sale.totalAmount,
            });
          }
        });

        return Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);
      },

      getMyRecentBuyers: (sellerId) => {
        return get().sales
          .filter((s) => s.sellerId === sellerId)
          .slice(0, 10);
      },
    }),
    { name: 'seller-storage' }
  )
);
