import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut, ChevronLeft, Menu, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getInitials } from '@/lib/utils';
import { PageTransition } from '@/components/layout/PageTransition';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', path: '/admin/users', icon: Users },
];

const AdminShell = () => {
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
          isSidebarOpen ? 'w-[240px]' : 'w-[72px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-black" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">Admin Panel</span>
                <span className="text-[10px] text-white/40">MartX</span>
              </div>
            </div>
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
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
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
                <p className="text-xs text-white/40 truncate">{user.role}</p>
              </div>
            </div>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <Package className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Back to Store</span>}
          </Link>
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
          'flex-1 transition-all duration-300 relative',
          isSidebarOpen ? 'ml-[240px]' : 'ml-[72px]'
        )}
      >
        <PageTransition>
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export { AdminShell };
