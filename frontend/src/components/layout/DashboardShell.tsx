import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Heart, Settings, LogOut, ChevronLeft, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getInitials } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Wishlist', path: '/dashboard/wishlist', icon: Heart },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
];

const DashboardShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-[#0A0A0A] border-r border-white/[0.06] z-30 transition-all duration-300 flex flex-col',
          isSidebarOpen ? 'w-[220px]' : 'w-[72px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          {isSidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold text-white">
                Mart<span className="text-white/50">X</span>
              </span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/40 hover:text-danger hover:bg-danger/5 transition-all duration-300"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        id="main"
        className={cn(
          'flex-1 transition-all duration-300',
          isSidebarOpen ? 'ml-[220px]' : 'ml-[72px]'
        )}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export { DashboardShell };
