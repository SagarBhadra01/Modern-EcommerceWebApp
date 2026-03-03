import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';
import { Loader2 } from 'lucide-react';

const statusOptions = ['processing', 'shipped', 'delivered', 'cancelled'] as const;
const statusFilters = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  processing: { variant: 'warning', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

const ManageOrders = () => {
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>('All');
  const queryClient = useQueryClient();

  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['admin-orders', activeFilter],
    queryFn: () => adminService.getOrders({
      limit: 50,
      status: activeFilter === 'All' ? undefined : activeFilter.toLowerCase(),
    }),
  });

  const orders = orderData?.orders || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminService.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const updateStatus = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

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
  }, [activeFilter, orders.length]);

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Manage Orders</h1>
        <Button variant="secondary" className="shadow-[0_0_15px_rgba(255,255,255,0.05)] border-white/[0.1] hover:bg-white/5">
          Export
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
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

      {/* Table */}
      <div className="bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-white/30 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Order ID</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Customer</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Date</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Items</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Total</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id} ref={(el) => { rowsRef.current[i] = el; }} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-5 text-sm font-mono text-white/90 group-hover:text-white transition-colors">{order.id.slice(0, 12)}...</td>
                    <td className="py-4 px-5 text-sm font-medium text-white/80">{order.user.name}</td>
                    <td className="py-4 px-5 text-sm text-white/50">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-5 text-sm font-medium text-white/60">{order.items.length}</td>
                    <td className="py-4 px-5 text-sm font-bold text-white">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-5">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={cn(
                            'h-9 pl-3 pr-8 text-xs font-bold rounded-lg border bg-black focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-colors hover:bg-white/[0.02]',
                            order.status === 'processing' && 'text-warning border-warning/30 focus:ring-warning/20',
                            order.status === 'shipped' && 'text-white/70 border-white/20 focus:ring-white/20',
                            order.status === 'delivered' && 'text-success border-success/30 focus:ring-success/20',
                            order.status === 'cancelled' && 'text-danger border-danger/30 focus:ring-danger/20',
                          )}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s} className="bg-black text-white">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/40">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
              <span className="text-white/20 text-2xl">🛒</span>
            </div>
            <p className="text-base text-white/60 font-medium">No orders found.</p>
            <p className="text-sm text-white/30 mt-1">Try changing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
