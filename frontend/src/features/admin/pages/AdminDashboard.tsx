import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DollarSign, ShoppingBag, Users, Package, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { orders } from '@/lib/mockData';

const stats = [
  { label: 'Total Revenue', value: '$48,250', trend: '+22%', icon: DollarSign },
  { label: 'Total Orders', value: '842', trend: '+15%', icon: ShoppingBag },
  { label: 'Total Users', value: '3,240', trend: '+8%', icon: Users },
  { label: 'Products', value: '156', trend: '+4', icon: Package },
];

const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  processing: { variant: 'warning', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

const chartData = [35, 55, 40, 70, 60, 85, 75, 90, 65, 80, 50, 95];

const AdminDashboard = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(
        statsRef.current ? statsRef.current.children : [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );

      tl.fromTo(
        containerRef.current ? containerRef.current.children : [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      );

      if (chartRef.current) {
        gsap.fromTo(
          chartRef.current.children,
          { height: 0 },
          { height: (i) => `${chartData[i]}%`, duration: 0.8, stagger: 0.03, ease: 'back.out(1.2)', delay: 0.3 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Overview of your store performance.</p>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-[#050505] border border-white/[0.08] shadow-lg rounded-xl p-5 hover:border-white/[0.12] transition-colors opacity-0"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/80 flex items-center justify-center shadow-inner">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-success">
                <ArrowUpRight className="h-3 w-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sales Overview */}
        <div className="lg:col-span-3 bg-[#050505] border border-white/[0.08] shadow-xl rounded-xl p-6 opacity-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Sales Overview</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-white/50">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span>+22% this month</span>
            </div>
          </div>
          {/* Simple bar chart */}
          <div ref={chartRef} className="flex items-end gap-2 h-48">
            {chartData.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/[0.08] hover:bg-white/[0.15] border-t border-white/[0.1] rounded-t-lg transition-colors duration-300 cursor-pointer"
                style={{ height: '0%' }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 px-1">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <span key={m} className="text-[10px] font-medium text-white/30 flex-1 text-center uppercase tracking-wider">{m}</span>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#050505] border border-white/[0.08] shadow-xl rounded-xl p-6 opacity-0">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Recent Orders</h2>
          <div className="space-y-1">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] p-2 rounded-lg transition-colors cursor-pointer" data-hover>
                <div>
                  <p className="text-sm font-mono text-white/90">{order.id}</p>
                  <p className="text-xs text-white/40 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white mb-1.5">{formatCurrency(order.total)}</p>
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
