import { useState } from 'react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { orders } from '@/lib/mockData';
import type { Order } from '@/types';

const statusOptions = ['processing', 'shipped', 'delivered', 'cancelled'] as const;
const statusFilters = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  processing: { variant: 'warning', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

const ManageOrders = () => {
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>('All');

  const filteredOrders = activeFilter === 'All'
    ? orderList
    : orderList.filter((o) => o.status === activeFilter.toLowerCase());

  const updateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrderList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Orders</h1>
        <Button variant="secondary">Export</Button>
      </div>

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

      {/* Table */}
      <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Order ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Items</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Total</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-white">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-white/40">{order.shippingAddress.fullName}</td>
                  <td className="py-3 px-4 text-sm text-white/40">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4 text-sm text-white/40">{order.items.length}</td>
                  <td className="py-3 px-4 text-sm font-medium text-white">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                      className={cn(
                        'h-8 px-2 text-xs font-medium rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-white/20',
                        order.status === 'processing' && 'text-warning border-warning/30',
                        order.status === 'shipped' && 'text-white/50 border-white/20',
                        order.status === 'delivered' && 'text-success border-success/30',
                        order.status === 'cancelled' && 'text-danger border-danger/30',
                      )}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-[#0A0A0A] text-white">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
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

export default ManageOrders;
