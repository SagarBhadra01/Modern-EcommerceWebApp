import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <a href="#main" className="skip-to-main">
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-8 w-8 rounded-lg bg-white flex items-center justify-center"
            >
              <span className="text-black font-bold text-sm">M</span>
            </motion.div>
            <span className="text-lg font-bold text-white hidden sm:block">
              Mart<span className="text-white/50">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              >
                <Link
                  to={link.path}
                  className={cn(
                    'text-sm font-medium transition-colors duration-300 relative',
                    location.pathname === link.path
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                  )}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-white"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 hidden sm:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </motion.button>

            <Link
              to="/dashboard/wishlist"
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
                aria-label="Dashboard"
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:block ml-2">
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export { Navbar };
