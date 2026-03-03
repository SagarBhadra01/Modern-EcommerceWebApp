import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DollarSign, ShoppingBag, Users, Package, ArrowUpRight, TrendingUp, Crown, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';

const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  processing: { variant: 'warning', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

const AdminDashboard = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: adminStats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminService.getAnalytics,
  });

  const stats = adminStats ? [
    { label: 'Total Revenue', value: formatCurrency(adminStats.totalRevenue), trend: '+' + adminStats.revenueByDay.length + 'd data', icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Total Orders', value: adminStats.totalOrders.toLocaleString(), trend: 'All time', icon: ShoppingBag, color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), trend: 'Registered', icon: Users, color: 'from-purple-500/20 to-purple-500/5' },
    { label: 'Products Listed', value: adminStats.totalProducts.toLocaleString(), trend: 'Active', icon: Package, color: 'from-amber-500/20 to-amber-500/5' },
  ] : [];

  // Revenue chart data
  const revenueByDay = adminStats?.revenueByDay || [];
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  useEffect(() => {
    if (isLoading || !adminStats) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(
        statsRef.current ? statsRef.current.children : [],
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );

      tl.fromTo(
        containerRef.current ? containerRef.current.children : [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
        '-=0.3'
      );

      if (chartRef.current) {
        gsap.fromTo(
          chartRef.current.children,
          { height: 0 },
          { height: (i: number) => `${(revenueByDay[i]?.revenue / maxRevenue) * 100}%`, duration: 1, stagger: 0.05, ease: 'back.out(1.5)', delay: 0.5 }
        );
      }
    });

    return () => ctx.revert();
  }, [isLoading, adminStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Overview of your store performance and sales analytics.</p>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#050505] border border-white/[0.08] shadow-lg rounded-2xl p-5 hover:border-white/[0.15] transition-all duration-300 opacity-0 group cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.color} border border-white/10 text-white/80 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="h-3 w-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Revenue Overview</h2>
              <p className="text-xs text-white/30 mt-1">Last {revenueByDay.length} days</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{formatCurrency(adminStats?.totalRevenue || 0)} total</span>
            </div>
          </div>
          <div ref={chartRef} className="flex items-end gap-1 h-52">
            {revenueByDay.slice(-20).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-white/[0.12] to-white/[0.04] hover:from-white/[0.20] hover:to-white/[0.08] rounded-t-xl transition-all duration-300 cursor-pointer relative group"
                  style={{ height: '0%' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                    {formatCurrency(d.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 px-1">
            {revenueByDay.slice(-20).map((d, i) => (
              <span key={i} className="text-[8px] font-bold text-white/20 flex-1 text-center">{d.date.slice(5)}</span>
            ))}
          </div>
        </div>

        {/* Top Buyers */}
        <div className="lg:col-span-4 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Top Buyers</h2>
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            {(analytics?.topBuyers || []).slice(0, 6).map((buyer, i) => (
              <div key={buyer.email || i} className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-default" data-hover>
                <span className="text-xs font-bold text-white/20 w-5 text-center">#{i + 1}</span>
                <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(buyer.name || 'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{buyer.name || 'Unknown'}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{buyer.orderCount} orders</p>
                </div>
                <span className="text-sm font-bold text-white shrink-0">{formatCurrency(buyer.totalSpent)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-12 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Recent Orders</h2>
          <div className="space-y-1">
            {(adminStats?.recentOrders || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 px-2 rounded-xl border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-default" data-hover>
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(order.user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{order.user.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Order #{order.id.slice(0, 8)} • {formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <p className="text-sm font-bold text-white">{formatCurrency(order.total)}</p>
                  <Badge variant={statusMap[order.status]?.variant || 'default'}>
                    {statusMap[order.status]?.label || order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
