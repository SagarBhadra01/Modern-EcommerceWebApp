import { useState, useRef, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/shared/ProductCard';
import { orders, products } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';
import {
  Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronDown,
  MapPin, CreditCard, DollarSign, ShoppingBag, Heart, Star, ArrowUpRight,
  LayoutGrid
} from 'lucide-react';

/* ─── Tabs ────────────────────────────────────── */
const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
] as const;
type TabId = typeof tabs[number]['id'];

/* ─── Status helpers ──────────────────────────── */
const statusFilters = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
const statusMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string; icon: typeof Clock }> = {
  processing: { variant: 'warning', label: 'Processing', icon: Clock },
  shipped: { variant: 'info', label: 'Shipped', icon: Truck },
  delivered: { variant: 'success', label: 'Delivered', icon: CheckCircle },
  cancelled: { variant: 'danger', label: 'Cancelled', icon: XCircle },
};
const timelineSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
function getTimelineIndex(status: string) {
  switch (status) { case 'processing': return 1; case 'shipped': return 2; case 'delivered': return 3; case 'cancelled': return -1; default: return 0; }
}

/* ─── Overview stats ──────────────────────────── */
const overviewStats = [
  { label: 'Total Orders', value: orders.length.toString(), trend: '+12%', icon: ShoppingBag, color: 'from-blue-500/20 to-blue-500/5' },
  { label: 'Total Spent', value: formatCurrency(orders.reduce((s, o) => s + o.total, 0)), trend: '+8%', icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5' },
  { label: 'Wishlist Items', value: '4', trend: '+2', icon: Heart, color: 'from-pink-500/20 to-pink-500/5' },
  { label: 'Loyalty Points', value: '1,250', trend: '+150', icon: Star, color: 'from-amber-500/20 to-amber-500/5' },
];

/* ─── Component ───────────────────────────────── */
const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Wishlist
  const [wishlistIds, setWishlistIds] = useState<string[]>(['1', '3', '5', '7']);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = activeFilter === 'All' || o.status === activeFilter.toLowerCase();
    const matchesSearch = !searchQuery || o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Hero anim
  useEffect(() => {
    if (heroRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(heroRef.current!.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
      }, heroRef);
      return () => ctx.revert();
    }
  }, []);

  // Content anim on tab change
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, [activeTab]);

  // Cards animation
  useEffect(() => {
    const activeCards = cardsRef.current.filter(Boolean);
    if (activeCards.length > 0) {
      gsap.fromTo(activeCards, { opacity: 0, y: 20, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'all' });
    }
  }, [activeFilter, searchQuery, filteredOrders.length]);

  const handleRemoveWishlist = (id: string) => {
    setWishlistIds((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div ref={heroRef} className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.02] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] mb-6">
            <Package className="h-3.5 w-3.5 text-white/60" />
            <span className="text-xs font-medium text-white/60 tracking-wide uppercase">My Account</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Orders & <span className="text-white/50">Activity</span>
          </h1>
          <p className="text-white/40 text-lg mb-8 max-w-xl mx-auto font-light">
            Track orders, manage your wishlist, and view your purchase history.
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedOrder(null); }}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.25)]'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-white/[0.06]'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-5xl mx-auto px-4 pb-24">

        {/* ═════════ OVERVIEW TAB ═════════ */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {overviewStats.map((stat) => (
                <div key={stat.label} className="bg-[#050505] border border-white/[0.08] shadow-lg rounded-2xl p-5 hover:border-white/[0.15] transition-all group cursor-default">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.color} border border-white/10 text-white/80 flex items-center justify-center group-hover:scale-110 transition-transform`}>
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

            {/* Recent Orders Table */}
            <div className="bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <h2 className="text-lg font-bold text-white tracking-tight">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-sm font-medium text-white/50 hover:text-white transition-colors cursor-pointer">
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Order ID</th>
                      <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Date</th>
                      <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Items</th>
                      <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Total</th>
                      <th className="text-left font-semibold py-3 px-5 text-xs text-white/40 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5 text-sm font-mono text-white/90">{order.id}</td>
                        <td className="py-4 px-5 text-sm text-white/50">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-5 text-sm text-white/50">{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                        <td className="py-4 px-5 text-sm font-bold text-white">{formatCurrency(order.total)}</td>
                        <td className="py-4 px-5">
                          <Badge variant={statusMap[order.status]?.variant || 'default'}>{statusMap[order.status]?.label || order.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════ ORDERS TAB ═════════ */}
        {activeTab === 'orders' && (
          <div>
            {/* Search + Filters */}
            <div className="relative max-w-lg mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
              <input type="text" placeholder="Search by Order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-13 pl-12 pr-6 bg-[#0A0A0A] border border-white/[0.08] rounded-2xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" />
            </div>
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {statusFilters.map((filter) => {
                const count = filter === 'All' ? orders.length : orders.filter((o) => o.status === filter.toLowerCase()).length;
                return (
                  <button key={filter} onClick={() => { setActiveFilter(filter); setExpandedOrder(null); }}
                    className={cn('px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2',
                      activeFilter === filter ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-white/[0.06]')}>
                    {filter}
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md', activeFilter === filter ? 'bg-black/10 text-black/60' : 'bg-white/5 text-white/30')}>{count}</span>
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
                  <div key={order.id} ref={(el) => { cardsRef.current[i] = el; }}
                    className="bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-300 shadow-lg">
                    <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full px-6 py-5 flex items-center justify-between text-left group">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                          order.status === 'delivered' && 'bg-success/10 border-success/20 text-success',
                          order.status === 'shipped' && 'bg-white/5 border-white/10 text-white/70',
                          order.status === 'processing' && 'bg-warning/10 border-warning/20 text-warning',
                          order.status === 'cancelled' && 'bg-danger/10 border-danger/20 text-danger')}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-mono font-bold text-white">{order.id}</span>
                            <Badge variant={statusInfo?.variant || 'default'}>{statusInfo?.label || order.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-white/40">
                            <span>{formatDate(order.createdAt)}</span><span>•</span>
                            <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span><span>•</span>
                            <span>{order.shippingAddress.fullName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-lg font-bold text-white">{formatCurrency(order.total)}</span>
                        <ChevronDown className={cn("h-5 w-5 text-white/30 transition-transform duration-300", isExpanded && "rotate-180")} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/[0.06] px-6 py-6 bg-[#020202]">
                        {/* Timeline */}
                        {order.status !== 'cancelled' && (
                          <div className="mb-8">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Order Timeline</h3>
                            <div className="flex items-center gap-0">
                              {timelineSteps.map((step, idx) => (
                                <Fragment key={step}>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                                      idx <= timelineIdx ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'bg-transparent text-white/20 border-white/10')}>
                                      {idx <= timelineIdx ? '✓' : idx + 1}
                                    </div>
                                    <span className={cn('text-[10px] font-medium whitespace-nowrap', idx <= timelineIdx ? 'text-white/80' : 'text-white/20')}>{step}</span>
                                  </div>
                                  {idx < timelineSteps.length - 1 && (<div className={cn('flex-1 h-0.5 mx-2 rounded-full mt-[-1rem]', idx < timelineIdx ? 'bg-white' : 'bg-white/10')} />)}
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                        {order.status === 'cancelled' && (
                          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-danger/5 border border-danger/10 rounded-xl">
                            <XCircle className="h-5 w-5 text-danger shrink-0" /><p className="text-sm text-danger/80">This order has been cancelled.</p>
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
                                  <Link to={`/products/${item.slug}`} className="text-sm font-bold text-white hover:text-white/80 transition-colors block truncate">{item.title}</Link>
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
                            <div className="flex items-center gap-2 mb-3"><MapPin className="h-4 w-4 text-white/40" /><span className="text-xs font-bold text-white/40 uppercase tracking-wider">Shipping Address</span></div>
                            <p className="text-sm text-white font-medium">{order.shippingAddress.fullName}</p>
                            <p className="text-xs text-white/50 mt-1">{order.shippingAddress.line1}</p>
                            <p className="text-xs text-white/50">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                          </div>
                          <div className="bg-[#0A0A0A] border border-white/[0.06] p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-3"><CreditCard className="h-4 w-4 text-white/40" /><span className="text-xs font-bold text-white/40 uppercase tracking-wider">Order Summary</span></div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs"><span className="text-white/50">Subtotal</span><span className="text-white font-medium">{formatCurrency(order.total * 0.9)}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-white/50">Shipping</span><span className="text-success font-medium">Free</span></div>
                              <div className="flex justify-between text-xs"><span className="text-white/50">Tax</span><span className="text-white font-medium">{formatCurrency(order.total * 0.1)}</span></div>
                              <div className="h-px bg-white/[0.06] my-2" />
                              <div className="flex justify-between text-sm"><span className="text-white font-bold">Total</span><span className="text-white font-bold">{formatCurrency(order.total)}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6"><Package className="h-8 w-8 text-white/15" /></div>
                <p className="text-lg text-white/60 font-medium mb-2">No orders found</p>
                <p className="text-sm text-white/30 mb-6">{searchQuery ? `No orders matching "${searchQuery}".` : 'No orders match the selected filter.'}</p>
                <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">Browse Products</Link>
              </div>
            )}
          </div>
        )}

        {/* ═════════ WISHLIST TAB ═════════ */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6"><Heart className="h-8 w-8 text-white/15" /></div>
                <p className="text-lg text-white/60 font-medium mb-2">Your wishlist is empty</p>
                <p className="text-sm text-white/30 mb-6">Save items you love and come back to them later.</p>
                <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">Browse Products</Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-white/40 mb-6">{wishlistProducts.length} items saved</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={true}
                      onAddToCart={(id) => { const p = products.find((p) => p.id === id); if (p) addItem(p); }}
                      onWishlistToggle={(id) => handleRemoveWishlist(id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
