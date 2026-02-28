import { useState, useRef, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { orders } from '@/lib/mockData';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, MapPin, CreditCard } from 'lucide-react';

const statusFilters = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string; icon: typeof Clock }> = {
  processing: { variant: 'warning', label: 'Processing', icon: Clock },
  shipped: { variant: 'info', label: 'Shipped', icon: Truck },
  delivered: { variant: 'success', label: 'Delivered', icon: CheckCircle },
  cancelled: { variant: 'danger', label: 'Cancelled', icon: XCircle },
};

const timelineSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

function getTimelineIndex(status: string) {
  switch (status) {
    case 'processing': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    case 'cancelled': return -1;
    default: return 0;
  }
}

const OrdersPage = () => {
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = activeFilter === 'All' || o.status === activeFilter.toLowerCase();
    const matchesSearch = !searchQuery || o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Hero entrance
  useEffect(() => {
    if (heroRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(heroRef.current!.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
        );
      }, heroRef);
      return () => ctx.revert();
    }
  }, []);

  // Cards animation
  useEffect(() => {
    const activeCards = cardsRef.current.filter(Boolean);
    if (activeCards.length > 0) {
      gsap.fromTo(activeCards,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [activeFilter, searchQuery, filteredOrders.length]);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div ref={heroRef} className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.02] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] mb-6">
            <Package className="h-3.5 w-3.5 text-white/60" />
            <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Order Tracking</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Track Your <span className="text-white/50">Orders</span>
          </h1>
          <p className="text-white/40 text-lg mb-8 max-w-xl mx-auto font-light">
            Stay updated on your purchases. Track shipments, view order details, and manage returns.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g., ORD-001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 bg-[#0A0A0A] border border-white/[0.08] rounded-2xl text-white text-base placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="max-w-5xl mx-auto px-4 pb-24">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {statusFilters.map((filter) => {
            const count = filter === 'All'
              ? orders.length
              : orders.filter((o) => o.status === filter.toLowerCase()).length;
            return (
              <button
                key={filter}
                onClick={() => { setActiveFilter(filter); setExpandedOrder(null); }}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2',
                  activeFilter === filter
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-white/[0.06] hover:border-white/[0.12]'
                )}
              >
                {filter}
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                  activeFilter === filter ? 'bg-black/10 text-black/60' : 'bg-white/5 text-white/30'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {filteredOrders.map((order, i) => {
            const isExpanded = expandedOrder === order.id;
            const statusInfo = statusMap[order.status];
            const StatusIcon = statusInfo?.icon || Clock;
            const timelineIdx = getTimelineIndex(order.status);

            return (
              <div
                key={order.id}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-300 shadow-lg"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                      order.status === 'delivered' && 'bg-success/10 border-success/20 text-success',
                      order.status === 'shipped' && 'bg-white/5 border-white/10 text-white/70',
                      order.status === 'processing' && 'bg-warning/10 border-warning/20 text-warning',
                      order.status === 'cancelled' && 'bg-danger/10 border-danger/20 text-danger',
                    )}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    {/* Order Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-mono font-bold text-white">{order.id}</span>
                        <Badge variant={statusInfo?.variant || 'default'}>
                          {statusInfo?.label || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>{formatDate(order.createdAt)}</span>
                        <span>•</span>
                        <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{order.shippingAddress.fullName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total + Expand */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-lg font-bold text-white">{formatCurrency(order.total)}</span>
                    <ChevronDown className={cn(
                      "h-5 w-5 text-white/30 transition-transform duration-300",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] px-6 py-6 bg-[#020202] animate-in slide-in-from-top-2 duration-300">
                    {/* Timeline */}
                    {order.status !== 'cancelled' && (
                      <div className="mb-8">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Order Timeline</h3>
                        <div className="flex items-center gap-0">
                          {timelineSteps.map((step, idx) => (
                            <Fragment key={step}>
                              <div className="flex flex-col items-center gap-2">
                                <div className={cn(
                                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                                  idx <= timelineIdx
                                    ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                                    : 'bg-transparent text-white/20 border-white/10'
                                )}>
                                  {idx <= timelineIdx ? '✓' : idx + 1}
                                </div>
                                <span className={cn(
                                  'text-[10px] font-medium whitespace-nowrap',
                                  idx <= timelineIdx ? 'text-white/80' : 'text-white/20'
                                )}>
                                  {step}
                                </span>
                              </div>
                              {idx < timelineSteps.length - 1 && (
                                <div className={cn(
                                  'flex-1 h-0.5 mx-2 rounded-full mt-[-1rem]',
                                  idx < timelineIdx ? 'bg-white' : 'bg-white/10'
                                )} />
                              )}
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-danger/5 border border-danger/10 rounded-xl">
                        <XCircle className="h-5 w-5 text-danger shrink-0" />
                        <p className="text-sm text-danger/80">This order has been cancelled.</p>
                      </div>
                    )}

                    {/* Items */}
                    <div className="mb-6">
                      <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Items Ordered</h3>
                      <div className="grid gap-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 bg-[#0A0A0A] border border-white/[0.06] p-4 rounded-xl hover:border-white/[0.12] transition-colors group">
                            <img src={item.images[0]} alt={item.title} className="h-16 w-16 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                            <div className="flex-1 min-w-0">
                              <Link to={`/products/${item.slug}`} className="text-sm font-bold text-white hover:text-white/80 transition-colors block truncate">
                                {item.title}
                              </Link>
                              <p className="text-xs text-white/40 mt-1">{item.category}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
                              <p className="text-xs text-white/40 mt-0.5">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0A0A0A] border border-white/[0.06] p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-white/40" />
                          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Shipping Address</span>
                        </div>
                        <p className="text-sm text-white font-medium">{order.shippingAddress.fullName}</p>
                        <p className="text-xs text-white/50 mt-1">{order.shippingAddress.line1}</p>
                        <p className="text-xs text-white/50">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      </div>
                      <div className="bg-[#0A0A0A] border border-white/[0.06] p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="h-4 w-4 text-white/40" />
                          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Order Summary</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Subtotal</span>
                            <span className="text-white font-medium">{formatCurrency(order.total * 0.9)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Shipping</span>
                            <span className="text-success font-medium">Free</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">Tax</span>
                            <span className="text-white font-medium">{formatCurrency(order.total * 0.1)}</span>
                          </div>
                          <div className="h-px bg-white/[0.06] my-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-white font-bold">Total</span>
                            <span className="text-white font-bold">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="h-20 w-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6">
              <Package className="h-8 w-8 text-white/15" />
            </div>
            <p className="text-lg text-white/60 font-medium mb-2">No orders found</p>
            <p className="text-sm text-white/30 mb-6 max-w-sm">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try a different search term.`
                : 'No orders match the selected filter.'}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
