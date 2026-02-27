import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AdminShell } from '@/components/layout/AdminShell';

// Pages
import Landing from '@/features/home/pages/Landing';
import ProductList from '@/features/products/pages/ProductList';
import ProductDetail from '@/features/products/pages/ProductDetail';
import Cart from '@/features/cart/pages/Cart';
import Checkout from '@/features/checkout/pages/Checkout';
import OrderSuccess from '@/features/checkout/pages/OrderSuccess';
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import UserDashboard from '@/features/dashboard/pages/UserDashboard';
import Orders from '@/features/dashboard/pages/Orders';
import Wishlist from '@/features/dashboard/pages/Wishlist';
import Settings from '@/features/dashboard/pages/Settings';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import ManageProducts from '@/features/admin/pages/ManageProducts';
import ManageOrders from '@/features/admin/pages/ManageOrders';
import ManageUsers from '@/features/admin/pages/ManageUsers';
// Public layout with Navbar + Footer
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main id="main" className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/products', element: <ProductList /> },
      { path: '/products/:slug', element: <ProductDetail /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/checkout/success', element: <OrderSuccess /> },
    ],
  },

  // Auth routes (no navbar/footer)
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },

  // Dashboard routes
  {
    element: <DashboardShell />,
    children: [
      { path: '/dashboard', element: <UserDashboard /> },
      { path: '/dashboard/orders', element: <Orders /> },
      { path: '/dashboard/wishlist', element: <Wishlist /> },
      { path: '/dashboard/settings', element: <Settings /> },
    ],
  },

  // Admin routes
  {
    element: <AdminShell />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/products', element: <ManageProducts /> },
      { path: '/admin/orders', element: <ManageOrders /> },
      { path: '/admin/users', element: <ManageUsers /> },
    ],
  },
]);
