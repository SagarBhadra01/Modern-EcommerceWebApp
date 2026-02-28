import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { DollarSign, ShoppingBag, Heart, Star, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { orders } from '@/lib/mockData';
import { useUser } from '@clerk/clerk-react';

const stats = [
  { label: 'Total Orders', value: '24', trend: '+12%', icon: ShoppingBag },
  { label: 'Total Spent', value: '$2,489', trend: '+8%', icon: DollarSign },
  { label: 'Wishlist Items', value: '7', trend: '+3', icon: Heart },
  { label: 'Loyalty Points', value: '1,250', trend: '+150', icon: Star },
];

const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  processing: { variant: 'warning', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

const UserDashboard = () => {
  const { user } = useUser();
  const firstName = user?.firstName || 'there';
  
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(headerRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .fromTo(
          statsRef.current ? statsRef.current.children : [],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(ordersRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <div ref={headerRef} className="mb-8 opacity-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-sm text-white/40 mt-1 font-light">Here is what is happening with your account.</p>
      </div>

      {/* Stat Cards */}
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

      {/* Recent Orders */}
      <div ref={ordersRef} className="bg-[#050505] border border-white/[0.08] shadow-xl rounded-xl p-6 opacity-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm font-medium text-white/50 hover:text-white transition-colors" data-hover>
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left font-semibold py-3 px-2 text-xs text-white/40 uppercase tracking-wider">Order ID</th>
                <th className="text-left font-semibold py-3 px-2 text-xs text-white/40 uppercase tracking-wider">Date</th>
                <th className="text-left font-semibold py-3 px-2 text-xs text-white/40 uppercase tracking-wider">Items</th>
                <th className="text-left font-semibold py-3 px-2 text-xs text-white/40 uppercase tracking-wider">Total</th>
                <th className="text-left font-semibold py-3 px-2 text-xs text-white/40 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-2 text-sm font-mono text-white/90">{order.id}</td>
                  <td className="py-4 px-2 text-sm text-white/50">{formatDate(order.createdAt)}</td>
                  <td className="py-4 px-2 text-sm text-white/50">{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                  <td className="py-4 px-2 text-sm font-bold text-white">{formatCurrency(order.total)}</td>
                  <td className="py-4 px-2">
                    <Badge variant={statusMap[order.status]?.variant || 'default'}>
                      {statusMap[order.status]?.label || order.status}
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

export default UserDashboard;
