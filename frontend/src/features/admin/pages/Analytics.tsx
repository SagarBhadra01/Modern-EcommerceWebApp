import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingUp, DollarSign, ShoppingCart, Eye, ArrowRightLeft, Loader2 } from 'lucide-react';
import { formatCurrency, getInitials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';

const Analytics = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminService.getAnalytics,
  });

  const isLoading = statsLoading || analyticsLoading;

  // Conversion metrics from real stats
  const conversionMetrics = stats ? [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, sublabel: '100%' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, sublabel: `${stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%` },
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Eye, sublabel: 'Registered' },
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: ArrowRightLeft, sublabel: 'Listed' },
  ] : [];

  // Revenue chart from stats
  const revenueByDay = stats?.revenueByDay || [];
  const maxDayRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  // Order status breakdown from analytics
  const ordersByStatus = analytics?.ordersByStatus || [];

  // Top buyers from analytics
  const topBuyers = analytics?.topBuyers || [];

  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(containerRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Deep insights into your store performance, sales, and customer behavior.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 opacity-0">
        {conversionMetrics.map((metric) => (
          <div key={metric.label} className="bg-[#050505] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                <metric.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white/20">{metric.sublabel}</span>
            </div>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            <p className="text-xs text-white/40 mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl mb-6 opacity-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Revenue Trend</h2>
            <p className="text-xs text-white/30 mt-1">Daily revenue for the last {revenueByDay.length} days</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{formatCurrency(stats?.totalRevenue || 0)} total</span>
          </div>
        </div>
        <div className="flex items-end gap-[3px] h-44">
          {revenueByDay.map((d, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-white/[0.15] to-white/[0.03] hover:from-white/[0.25] hover:to-white/[0.08] rounded-t-lg transition-all duration-200 cursor-pointer relative group"
              style={{ height: `${(d.revenue / maxDayRevenue) * 100}%`, minHeight: '2px' }}
            >
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-10">
                {d.date}: {formatCurrency(d.revenue)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-0">
          {revenueByDay.filter((_, i) => i % Math.max(1, Math.floor(revenueByDay.length / 7)) === 0).map((d, i) => (
            <span key={i} className="text-[9px] font-bold text-white/20">{d.date.slice(5)}</span>
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
                {topBuyers.slice(0, 8).map((buyer, i) => (
                  <tr key={buyer.email || i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {getInitials(buyer.name || 'U')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{buyer.name || 'Unknown'}</p>
                          <p className="text-[10px] text-white/30">{buyer.email || ''}</p>
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

        {/* Order Status Breakdown */}
        <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Orders by Status</h2>
          <div className="space-y-5">
            {ordersByStatus.map((item) => {
              const total = ordersByStatus.reduce((s, x) => s + x._count.id, 0) || 1;
              const pct = Math.round((item._count.id / total) * 100);
              const colors: Record<string, string> = {
                processing: 'from-amber-400/50 to-amber-500/20',
                shipped: 'from-blue-400/50 to-blue-500/20',
                delivered: 'from-emerald-400/50 to-emerald-500/20',
                cancelled: 'from-red-400/50 to-red-500/20',
              };
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/70 capitalize">{item.status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">{item._count.id} orders</span>
                      <span className="text-xs font-bold text-white/50">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors[item.status] || 'from-white/30 to-white/10'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
