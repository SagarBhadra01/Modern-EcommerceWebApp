import { useState, useRef, useEffect, Fragment } from 'react';
import gsap from 'gsap';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter((o) => o.status === activeFilter.toLowerCase());

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    const activeRows = rowsRef.current.filter(Boolean);
    if (activeRows.length > 0) {
      gsap.fromTo(activeRows,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [activeFilter, filteredOrders.length]);

  return (
    <div ref={containerRef} className="opacity-0">
      <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">My Orders</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setExpandedOrder(null);
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300',
              activeFilter === filter
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="text-left py-4 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Order ID</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Items</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Total</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <Fragment key={order.id}>
                  <tr
                    ref={(el) => { rowsRef.current[i] = el; }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <td className="py-4 px-4 text-sm font-mono text-white/90 group-hover:text-white transition-colors">{order.id}</td>
                    <td className="py-4 px-4 text-sm text-white/50">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4 text-sm text-white/50">{order.items.length}</td>
                    <td className="py-4 px-4 text-sm font-bold text-white">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-4">
                      <Badge variant={statusMap[order.status]?.variant || 'default'}>
                        {statusMap[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-sm font-medium text-white/30 group-hover:text-white h-7 px-3 rounded bg-white/[0.03] group-hover:bg-white/10 transition-all">
                        {expandedOrder === order.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan={6} className="px-0 py-0 bg-[#020202] border-b border-white/[0.04]">
                        <div className="px-4 py-6">
                          <div className="flex flex-wrap gap-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 bg-[#0A0A0A] border border-white/[0.08] p-3 rounded-xl shadow-inner hover:border-white/20 transition-colors">
                                <img src={item.images[0]} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                                <div>
                                  <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                                  <p className="text-xs font-medium text-white/40">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
              <span className="text-white/20 text-2xl">📦</span>
            </div>
            <p className="text-base text-white/60 font-medium">No orders found.</p>
            <p className="text-sm text-white/30 mt-1">Try changing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
