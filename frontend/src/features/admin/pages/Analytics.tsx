import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingUp, DollarSign, ShoppingCart, Eye, ArrowRightLeft } from 'lucide-react';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { salesTransactions, salesData, topSellingProducts, categoryRevenue, products, orders } from '@/lib/mockData';
import { useAdminStore } from '@/store/adminStore';

// Combine mock sales with store sales for analytics
const conversionMetrics = [
  { label: 'Page Views', value: '24,521', icon: Eye, sublabel: '100%' },
  { label: 'Add to Cart', value: '3,842', icon: ShoppingCart, sublabel: '15.7%' },
  { label: 'Checkout', value: '1,893', icon: ArrowRightLeft, sublabel: '7.7%' },
  { label: 'Completed', value: '1,247', icon: DollarSign, sublabel: '5.1%' },
];

const Analytics = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const catChartRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);

  const { sales: storeSales } = useAdminStore();

  // Combine all sales (mock + store)
  const allSales = [...salesTransactions, ...storeSales.map(s => ({
    ...s,
    productImage: s.productImage,
  }))];

  // Compute top buyers
  const buyerMap = new Map<string, { name: string; email: string; totalSpent: number; orderCount: number }>();
  allSales.forEach((sale) => {
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
  const topBuyers = Array.from(buyerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 8);

  // Product performance
  const productPerformance = topSellingProducts.map((tp) => {
    const product = products.find((p) => p.id === tp.productId);
    return {
      ...tp,
      stock: product?.stock || 0,
      category: product?.category || '',
    };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(containerRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
        );
      }

      if (chartRef.current) {
        const bars = chartRef.current.children;
        const maxRevenue = Math.max(...salesData.map((d) => d.revenue));
        gsap.fromTo(bars,
          { height: 0 },
          {
            height: (i: number) => `${(salesData[i]?.revenue / maxRevenue) * 100}%`,
            duration: 0.8,
            stagger: 0.02,
            ease: 'back.out(1.2)',
            delay: 0.4,
          }
        );
      }

      if (catChartRef.current) {
        gsap.fromTo(
          catChartRef.current.querySelectorAll('.analytics-cat-bar'),
          { width: 0 },
          { width: (i: number) => `${categoryRevenue[i]?.percentage}%`, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.6 }
        );
      }

      if (funnelRef.current) {
        gsap.fromTo(funnelRef.current.children,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <div className="mb-8 opacity-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Deep insights into your store performance, sales, and customer behavior.</p>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 opacity-0">
        {conversionMetrics.map((metric, i) => (
          <div key={metric.label} className="bg-[#050505] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                <metric.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white/20">{metric.sublabel}</span>
            </div>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            <p className="text-xs text-white/40 mt-1">{metric.label}</p>
            {i < conversionMetrics.length - 1 && (
              <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 text-white/10">→</div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Trend (30-day) */}
      <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl mb-6 opacity-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Revenue Trend</h2>
            <p className="text-xs text-white/30 mt-1">Daily revenue for the last 30 days</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.3% vs last month</span>
          </div>
        </div>
        <div ref={chartRef} className="flex items-end gap-[3px] h-44">
          {salesData.map((d, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-white/[0.15] to-white/[0.03] hover:from-white/[0.25] hover:to-white/[0.08] rounded-t-lg transition-all duration-200 cursor-pointer relative group"
              style={{ height: '0%' }}
            >
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-10">
                {d.date}: ${d.revenue}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-0">
          {['1', '5', '10', '15', '20', '25', '30'].map((d) => (
            <span key={d} className="text-[9px] font-bold text-white/20">Feb {d}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Buyers */}
        <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Top Buyers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left pb-3 text-xs font-semibold text-white/30 uppercase tracking-wider">Customer</th>
                  <th className="text-left pb-3 text-xs font-semibold text-white/30 uppercase tracking-wider">Orders</th>
                  <th className="text-right pb-3 text-xs font-semibold text-white/30 uppercase tracking-wider">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topBuyers.map((buyer, i) => (
                  <tr key={buyer.email} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {getInitials(buyer.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{buyer.name}</p>
                          <p className="text-[10px] text-white/30">{buyer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm font-medium text-white/50">{buyer.orderCount}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-bold text-white">{formatCurrency(buyer.totalSpent)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Revenue by Category</h2>
          <div ref={catChartRef} className="space-y-5">
            {categoryRevenue.map((cat) => {
              const colors = ['from-blue-400/50 to-blue-500/20', 'from-purple-400/50 to-purple-500/20', 'from-amber-400/50 to-amber-500/20', 'from-emerald-400/50 to-emerald-500/20', 'from-pink-400/50 to-pink-500/20', 'from-cyan-400/50 to-cyan-500/20'];
              const colorIdx = categoryRevenue.indexOf(cat);
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/70">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">{formatCurrency(cat.revenue)}</span>
                      <span className="text-xs font-bold text-white/50">{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`analytics-cat-bar h-full rounded-full bg-gradient-to-r ${colors[colorIdx % colors.length]}`}
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl opacity-0">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-white tracking-tight">Product Performance</h2>
          <p className="text-xs text-white/30 mt-1">Sales data for top-performing products</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Rank</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Product</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Category</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Units Sold</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Revenue</th>
                <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, i) => (
                <tr key={product.productId} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                  <td className="py-4 px-5">
                    <span className={`text-sm font-bold ${i < 3 ? 'text-amber-400' : 'text-white/30'}`}>#{i + 1}</span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.title} className="h-10 w-10 rounded-lg object-cover border border-white/10" />
                      <span className="text-sm font-bold text-white truncate max-w-[200px]">{product.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-white/50">{product.category}</td>
                  <td className="py-4 px-5 text-sm font-bold text-white">{product.unitsSold}</td>
                  <td className="py-4 px-5 text-sm font-bold text-emerald-400">{formatCurrency(product.revenue)}</td>
                  <td className="py-4 px-5">
                    <Badge variant={product.stock > 30 ? 'success' : product.stock > 10 ? 'warning' : 'danger'}>
                      {product.stock} left
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
