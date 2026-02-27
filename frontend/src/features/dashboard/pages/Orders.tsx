import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { orders } from '@/lib/mockData';

const statusFilters = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  processing: { variant: 'warning', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter((o) => o.status === activeFilter.toLowerCase());

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300',
              activeFilter === filter
                ? 'bg-white text-black'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Order ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Items</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Total</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <Fragment key={order.id}>
                  <tr
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <td className="py-3 px-4 text-sm font-mono text-white">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-white/40">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 text-sm text-white/40">{order.items.length}</td>
                    <td className="py-3 px-4 text-sm font-medium text-white">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusMap[order.status]?.variant || 'default'}>
                        {statusMap[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-sm text-white/50 hover:text-white transition-colors">
                        {expandedOrder === order.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-black/50">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-4"
                          >
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 bg-[#0A0A0A] border border-white/[0.06] p-3 rounded-lg">
                                <img src={item.images[0]} alt={item.title} className="h-12 w-12 rounded-lg object-cover" />
                                <div>
                                  <p className="text-sm font-medium text-white">{item.title}</p>
                                  <p className="text-xs text-white/30">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <p className="text-sm text-white/30 text-center py-8">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
