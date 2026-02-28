import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { DollarSign, Package, ShoppingBag, TrendingUp, ArrowUpRight, Crown } from 'lucide-react';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useUser } from '@clerk/clerk-react';
import { useSellerStore } from '@/store/sellerStore';

const MyShop = () => {
  const { user } = useUser();
  const sellerId = user?.id || '';
  const { getMyProducts, getMySales, getMyRevenue, getMyTopProducts, getMyRecentBuyers } = useSellerStore();

  const myProducts = getMyProducts(sellerId);
  const mySales = getMySales(sellerId);
  const myRevenue = getMyRevenue(sellerId);
  const topProducts = getMyTopProducts(sellerId);
  const recentBuyers = getMyRecentBuyers(sellerId);
  const activeProducts = myProducts.filter((p) => p.status === 'active').length;

  const statsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(myRevenue), trend: '+22%', icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Products Listed', value: myProducts.length.toString(), trend: `${activeProducts} active`, icon: Package, color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Total Sales', value: mySales.length.toString(), trend: 'All time', icon: ShoppingBag, color: 'from-purple-500/20 to-purple-500/5' },
    { label: 'Avg. Order', value: mySales.length > 0 ? formatCurrency(myRevenue / mySales.length) : '$0', trend: 'Per sale', icon: TrendingUp, color: 'from-amber-500/20 to-amber-500/5' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (statsRef.current) {
        tl.fromTo(statsRef.current.children,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
        );
      }
      if (containerRef.current) {
        tl.fromTo(containerRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
          '-=0.3'
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Shop</h1>
        <p className="text-sm text-white/40 mt-1 font-light">Overview of your store, products, and sales performance.</p>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#050505] border border-white/[0.08] shadow-lg rounded-2xl p-5 hover:border-white/[0.15] transition-all duration-300 opacity-0 group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.color} border border-white/10 text-white/80 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
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

      {myProducts.length === 0 ? (
        /* Empty state for new sellers */
        <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-12 text-center">
          <div className="h-20 w-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-white/15" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Start selling today!</h2>
          <p className="text-sm text-white/40 max-w-md mx-auto mb-6 font-light">
            List your products, manage sales, and track your earnings — all from your personal shop dashboard.
          </p>
          <Link
            to="/dashboard/my-products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Products */}
          <div className="lg:col-span-7 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Top Products</h2>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-1">
                {topProducts.map((product, i) => (
                  <div key={product.productId} className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-default group">
                    <span className="text-xs font-bold text-white/20 w-5 text-center">#{i + 1}</span>
                    <img src={product.image} alt={product.title} className="h-10 w-10 rounded-lg object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{product.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">{product.unitsSold} units sold</p>
                    </div>
                    <span className="text-sm font-bold text-white shrink-0">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30 text-center py-8">No sales yet. Start selling to see top products!</p>
            )}
          </div>

          {/* Recent Buyers */}
          <div className="lg:col-span-5 bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 opacity-0">
            <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Recent Buyers</h2>
            {recentBuyers.length > 0 ? (
              <div className="space-y-1">
                {recentBuyers.slice(0, 6).map((sale) => (
                  <div key={sale.id} className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-default">
                    <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(sale.buyerName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{sale.buyerName}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{sale.productTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">{formatCurrency(sale.totalAmount)}</p>
                      <p className="text-[10px] text-white/30">{formatDate(sale.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30 text-center py-8">No buyers yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-0">
            <Link to="/dashboard/my-products" className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all group">
              <Package className="h-8 w-8 text-white/30 mb-3 group-hover:text-white/60 group-hover:scale-110 transition-all" />
              <h3 className="text-base font-bold text-white mb-1">Manage Products</h3>
              <p className="text-xs text-white/30">{myProducts.length} products listed</p>
            </Link>
            <Link to="/dashboard/sell" className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all group">
              <ShoppingBag className="h-8 w-8 text-white/30 mb-3 group-hover:text-white/60 group-hover:scale-110 transition-all" />
              <h3 className="text-base font-bold text-white mb-1">Record a Sale</h3>
              <p className="text-xs text-white/30">Point of sale for your products</p>
            </Link>
            <Link to="/dashboard/my-analytics" className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all group">
              <TrendingUp className="h-8 w-8 text-white/30 mb-3 group-hover:text-white/60 group-hover:scale-110 transition-all" />
              <h3 className="text-base font-bold text-white mb-1">View Analytics</h3>
              <p className="text-xs text-white/30">Sales trends and performance</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShop;
