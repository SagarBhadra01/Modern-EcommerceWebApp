import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DollarSign, ShoppingBag, TrendingUp, BarChart3, Package, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { sellerService, type SellerAnalyticsResponse } from '@/lib/services/seller.service';

const SellerAnalytics = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['seller-analytics'],
    queryFn: sellerService.getAnalytics,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['seller-products'],
    queryFn: sellerService.getProducts,
  });

  const totalRevenue = analytics?.totalRevenue || 0;
  const totalOrders = analytics?.totalOrders || 0;
  const topProducts = analytics?.topProducts || [];
  const recentBuyers = analytics?.recentBuyers || [];
  const revenueByDay = analytics?.revenueByDay || [];
  const maxDailyRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  // Category breakdown from products
  const categoryData = products.reduce<Record<string, { count: number }>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { count: 0 };
    acc[p.category].count += 1;
    return acc;
  }, {});
  const categories = Object.entries(categoryData).sort((a, b) => b[1].count - a[1].count);

  useEffect(() => {
    if (isLoading) return;
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="mb-8 opacity-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Analytics</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Deep insights into your store's performance.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 opacity-0">
        {[
          { label: 'Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5' },
          { label: 'Products', value: products.length.toString(), icon: Package, color: 'from-blue-500/20 to-blue-500/5' },
          { label: 'Sales', value: totalOrders.toString(), icon: ShoppingBag, color: 'from-purple-500/20 to-purple-500/5' },
          { label: 'Avg Order', value: totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '$0', icon: TrendingUp, color: 'from-amber-500/20 to-amber-500/5' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#050505] border border-white/[0.08] rounded-2xl p-5">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} border border-white/10 flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 mb-6 opacity-0">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-white/30" />
          <h2 className="text-lg font-bold text-white">Revenue (30 Days)</h2>
        </div>
        <div className="flex items-end justify-between gap-[2px] h-40">
          {revenueByDay.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A0A0A] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
                {formatDate(day.date)}: {formatCurrency(day.revenue)}
              </div>
              <div className="w-full rounded-t-sm bg-white/20 group-hover:bg-white/40 transition-colors"
                style={{ height: `${day.revenue > 0 ? Math.max((day.revenue / maxDailyRevenue) * 100, 4) : 2}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-white/20">30 days ago</span>
          <span className="text-[10px] text-white/20">Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-7 bg-[#050505] border border-white/[0.08] rounded-2xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-5">Product Performance</h2>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 px-2 text-xs text-white/40 uppercase font-semibold">#</th>
                  <th className="text-left py-3 px-2 text-xs text-white/40 uppercase font-semibold">Product</th>
                  <th className="text-left py-3 px-2 text-xs text-white/40 uppercase font-semibold">Units</th>
                  <th className="text-left py-3 px-2 text-xs text-white/40 uppercase font-semibold">Revenue</th>
                </tr></thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.productId} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="py-3 px-2 text-sm text-white/30">#{i + 1}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt="" className="h-8 w-8 rounded-lg object-cover border border-white/10" />
                          <span className="text-sm font-bold text-white truncate max-w-[180px]">{p.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-white/60">{p.unitsSold}</td>
                      <td className="py-3 px-2 text-sm font-bold text-white">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/30 text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-[#050505] border border-white/[0.08] rounded-2xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-5">By Category</h2>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-white">{cat}</span>
                    <span className="text-xs text-white/40">{data.count} products</span>
                  </div>
                  <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-white/40 to-white/20 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max((data.count / Math.max(...categories.map(([, d]) => d.count), 1)) * 100, 5)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/30 text-center py-8">Add products to see category breakdown</p>
          )}
        </div>

        {/* Recent Buyers */}
        <div className="lg:col-span-12 bg-[#050505] border border-white/[0.08] rounded-2xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-5">Recent Buyers</h2>
          {recentBuyers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 px-3 text-xs text-white/40 uppercase font-semibold">Buyer</th>
                  <th className="text-left py-3 px-3 text-xs text-white/40 uppercase font-semibold">Product</th>
                  <th className="text-left py-3 px-3 text-xs text-white/40 uppercase font-semibold">Qty</th>
                  <th className="text-left py-3 px-3 text-xs text-white/40 uppercase font-semibold">Amount</th>
                  <th className="text-left py-3 px-3 text-xs text-white/40 uppercase font-semibold">Payment</th>
                  <th className="text-left py-3 px-3 text-xs text-white/40 uppercase font-semibold">Date</th>
                </tr></thead>
                <tbody>
                  {recentBuyers.map((s) => (
                    <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{getInitials(s.buyerName)}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{s.buyerName}</p>
                            <p className="text-[10px] text-white/30 truncate">{s.buyerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-white/60 truncate max-w-[150px]">{s.productTitle}</td>
                      <td className="py-3 px-3 text-xs text-white/60">{s.quantity}</td>
                      <td className="py-3 px-3 text-xs font-bold text-white">{formatCurrency(s.totalAmount)}</td>
                      <td className="py-3 px-3"><Badge variant="default" className="text-[10px]">{s.paymentMethod}</Badge></td>
                      <td className="py-3 px-3 text-xs text-white/40">{formatDate(s.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/30 text-center py-8">No buyers yet. Make your first sale!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
