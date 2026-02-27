import { motion } from 'framer-motion';
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

const AdminDashboard = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Overview of your store performance.</p>
      </div>

      {/* Stats */}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sales Overview */}
        <div className="lg:col-span-3 bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Sales Overview</h2>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <TrendingUp className="h-3 w-3 text-success" />
              <span>+22% this month</span>
            </div>
          </div>
          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-48">
            {[35, 55, 40, 70, 60, 85, 75, 90, 65, 80, 50, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 bg-white/10 hover:bg-white/20 rounded-t-lg transition-colors duration-300 cursor-pointer"
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <span key={m} className="text-[10px] text-white/20 flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                <div>
                  <p className="text-sm font-mono text-white">{order.id}</p>
                  <p className="text-xs text-white/30">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatCurrency(order.total)}</p>
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
