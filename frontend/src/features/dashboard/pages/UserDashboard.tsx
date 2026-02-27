import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Heart, Star, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { orders } from '@/lib/mockData';
import { useAuthStore } from '@/store/authStore';

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
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-sm text-white/40 mt-1">Here is what is happening with your account.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 text-white/60 flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-success">
                <ArrowUpRight className="h-3 w-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/30 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm text-white/50 hover:text-white transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-2 text-xs font-medium text-white/30">Order ID</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-white/30">Date</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-white/30">Items</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-white/30">Total</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-white/30">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-2 text-sm font-mono text-white">{order.id}</td>
                  <td className="py-3 px-2 text-sm text-white/40">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-2 text-sm text-white/40">{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                  <td className="py-3 px-2 text-sm font-medium text-white">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-2">
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
