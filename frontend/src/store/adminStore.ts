import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface SaleTransaction {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  date: string;
}

interface AdminStore {
  sales: SaleTransaction[];
  addSale: (sale: Omit<SaleTransaction, 'id' | 'date'>) => void;
  getSalesHistory: () => SaleTransaction[];
  getTopBuyers: () => { name: string; email: string; totalSpent: number; orderCount: number }[];
  getTotalRevenue: () => number;
  getRevenueByDay: () => { date: string; revenue: number }[];
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: (sale) => {
        const newSale: SaleTransaction = {
          ...sale,
          id: `SALE-${generateId()}`,
          date: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ sales: [newSale, ...state.sales] }));
      },

      getSalesHistory: () => get().sales,

      getTopBuyers: () => {
        const sales = get().sales;
        const buyerMap = new Map<string, { name: string; email: string; totalSpent: number; orderCount: number }>();
        
        sales.forEach((sale) => {
          const existing = buyerMap.get(sale.buyerEmail);
          if (existing) {
            existing.totalSpent += sale.totalAmount;
            existing.orderCount += 1;
          } else {
            buyerMap.set(sale.buyerEmail, {
              name: sale.buyerName,
              email: sale.buyerEmail,
              totalSpent: sale.totalAmount,
              orderCount: 1,
            });
          }
        });

        return Array.from(buyerMap.values())
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10);
      },

      getTotalRevenue: () => {
        return get().sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      },

      getRevenueByDay: () => {
        const sales = get().sales;
        const dayMap = new Map<string, number>();
        
        sales.forEach((sale) => {
          const existing = dayMap.get(sale.date) || 0;
          dayMap.set(sale.date, existing + sale.totalAmount);
        });

        return Array.from(dayMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },
    }),
    { name: 'admin-storage' }
  )
);
