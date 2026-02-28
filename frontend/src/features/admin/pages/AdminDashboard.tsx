import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DollarSign, ShoppingBag, Users, Package, ArrowUpRight, TrendingUp, Crown } from 'lucide-react';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { orders, topSellingProducts, revenueByMonth, salesTransactions, categoryRevenue } from '@/lib/mockData';

const stats = [
  { label: 'Total Revenue', value: '$48,250', trend: '+22%', icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5' },
  { label: 'Total Orders', value: '1,247', trend: '+15%', icon: ShoppingBag, color: 'from-blue-500/20 to-blue-500/5' },
  { label: 'Active Customers', value: '3,240', trend: '+8%', icon: Users, color: 'from-purple-500/20 to-purple-500/5' },
  { label: 'Products Listed', value: '156', trend: '+4', icon: Package, color: 'from-amber-500/20 to-amber-500/5' },
];

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
  const catChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          { height: (i: number) => `${(revenueByMonth[i]?.revenue / 500)}%`, duration: 1, stagger: 0.08, ease: 'back.out(1.5)', delay: 0.5 }
        );
      }

      if (catChartRef.current) {
        gsap.fromTo(
          catChartRef.current.querySelectorAll('.cat-bar'),
          { width: 0 },
          { width: (i: number) => `${categoryRevenue[i]?.percentage}%`, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.8 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

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
        <div className="lg:col-span-7 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Revenue Overview</h2>
              <p className="text-xs text-white/30 mt-1">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+22% growth</span>
            </div>
          </div>
          <div ref={chartRef} className="flex items-end gap-3 h-52">
            {revenueByMonth.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-white/[0.12] to-white/[0.04] hover:from-white/[0.20] hover:to-white/[0.08] rounded-t-xl transition-all duration-300 cursor-pointer relative group"
                  style={{ height: '0%' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                    ${(d.revenue / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 px-1">
            {revenueByMonth.map((d) => (
              <span key={d.month} className="text-[10px] font-bold text-white/25 flex-1 text-center uppercase tracking-wider">{d.month}</span>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-5 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Top Selling</h2>
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            {topSellingProducts.map((product, i) => (
              <div key={product.productId} className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-default group" data-hover>
                <span className="text-xs font-bold text-white/20 w-5 text-center">#{i + 1}</span>
                <img src={product.image} alt={product.title} className="h-10 w-10 rounded-lg object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{product.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">{product.unitsSold} units sold</p>
                </div>
                <span className="text-sm font-bold text-white shrink-0">{formatCurrency(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Revenue */}
        <div className="lg:col-span-5 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Sales by Category</h2>
          <div ref={catChartRef} className="space-y-4">
            {categoryRevenue.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white/70">{cat.category}</span>
                  <span className="text-xs font-bold text-white/40">{cat.percentage}%</span>
                </div>
                <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="cat-bar h-full rounded-full bg-gradient-to-r from-white/30 to-white/10"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Buyers */}
        <div className="lg:col-span-4 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Recent Buyers</h2>
          <div className="space-y-1">
            {salesTransactions.slice(0, 6).map((sale) => (
              <div key={sale.id} className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-default" data-hover>
                <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(sale.buyerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{sale.buyerName}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{sale.productTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{formatCurrency(sale.totalAmount)}</p>
                  <p className="text-[10px] text-white/30">{formatDate(sale.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Recent Orders</h2>
          <div className="space-y-1">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 px-2 rounded-xl border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-default" data-hover>
                <div>
                  <p className="text-xs font-mono font-bold text-white/90">{order.id}</p>
                  <p className="text-[10px] text-white/30 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white mb-1.5">{formatCurrency(order.total)}</p>
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
