import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isAuthenticated, user } = useAuthStore();
  
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);

  // Entrance animation
  useEffect(() => {
    if (!navRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(navRef.current, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.out' });
      
      if (linksRef.current.length) {
        tl.from(linksRef.current, { y: -10, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, "-=0.2");
      }
    }, navRef);
    return () => ctx.revert();
  }, []);

  // Mobile menu animate in/out
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (mobileOpen) {
      gsap.to(mobileMenuRef.current, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' });
      gsap.fromTo(mobileMenuRef.current.querySelectorAll('a'), 
        { y: -10, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1, ease: 'power2.out' }
      );
    } else {
      gsap.to(mobileMenuRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.in' });
    }
  }, [mobileOpen]);

  // Hover animations for logo
  const handleLogoHover = () => gsap.to(logoRef.current, { scale: 1.05, duration: 0.2 });
  const handleLogoLeave = () => gsap.to(logoRef.current, { scale: 1, duration: 0.2 });

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <a href="#main" className="skip-to-main">
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
            data-hover
          >
            <div
              ref={logoRef}
              className="h-8 w-8 rounded-lg bg-white flex items-center justify-center transform origin-center"
            >
              <span className="text-black font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">
              Mart<span className="text-white/50">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <div
                key={link.path}
                ref={(el) => { linksRef.current[i] = el; }}
              >
                <Link
                  to={link.path}
                  data-hover
                  className={cn(
                    'text-sm font-medium transition-colors duration-300 relative group',
                    location.pathname === link.path
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                  )}
                >
                  {link.label}
                  {/* CSS Underline instead of framer-motion layoutId */}
                  <div className={cn(
                    "absolute -bottom-1 left-0 right-0 h-px bg-white transform origin-left transition-transform duration-300",
                    location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )} />
                </Link>
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              data-hover
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 hidden sm:flex transform hover:scale-105 active:scale-95"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/dashboard/wishlist"
              data-hover
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 hidden sm:flex transform hover:scale-105 active:scale-95"
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
                <span
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center animate-in zoom-in"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                data-hover
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 transform hover:scale-105 active:scale-95"
                aria-label="Dashboard"
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/login" data-hover className="hidden sm:block ml-2">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

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
          {!isAuthenticated && (
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button fullWidth size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
