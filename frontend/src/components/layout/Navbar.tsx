import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ShoppingCart, Menu, X, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Orders', path: '/orders' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isSignedIn, user } = useUser();

  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileOpen) {
        gsap.to(mobileMenuRef.current, {
          height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out',
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0, opacity: 0, duration: 0.2, ease: 'power2.in',
        });
      }
    }
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      <div ref={navRef} className="bg-black/80 backdrop-blur-xl border-b border-white/[0.06] opacity-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 shrink-0"
              data-hover
            >
              <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                <span className="text-black font-black text-base">M</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight hidden sm:inline">
                Mart<span className="text-white/40">X</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-hover
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                    location.pathname === link.path
                      ? 'text-white bg-white/5'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2">
              <Link
                to="/products"
                data-hover
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 transform hover:scale-105 active:scale-95"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                to="/orders"
                data-hover
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 hidden sm:block transform hover:scale-105 active:scale-95"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <Link
                to="/cart"
                data-hover
                className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 transform hover:scale-105 active:scale-95"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {itemCount}
                  </span>
                )}
              </Link>

              <SignedIn>
                <Link
                  to="/dashboard"
                  data-hover
                  className="ml-1 h-9 w-9 rounded-full overflow-hidden border-2 border-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-[0_0_12px_rgba(255,255,255,0.1)] hidden sm:block"
                  aria-label="Seller Dashboard"
                >
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                  )}
                </Link>
              </SignedIn>
              <SignedOut>
                <Link to="/login" data-hover className="hidden sm:block ml-2">
                  <Button size="sm">Sign In</Button>
                </Link>
              </SignedOut>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 md:hidden"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl overflow-hidden h-0 opacity-0"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.path
                    ? 'text-white bg-white/5'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            <SignedOut>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button fullWidth size="sm">Sign In</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
