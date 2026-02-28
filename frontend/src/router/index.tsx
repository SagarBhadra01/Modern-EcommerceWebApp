import { createBrowserRouter, Outlet } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AdminShell } from '@/components/layout/AdminShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import Landing from '@/features/home/pages/Landing';
import ProductList from '@/features/products/pages/ProductList';
import ProductDetail from '@/features/products/pages/ProductDetail';
import Cart from '@/features/cart/pages/Cart';
import Checkout from '@/features/checkout/pages/Checkout';
import OrderSuccess from '@/features/checkout/pages/OrderSuccess';
import OrdersPage from '@/features/orders/pages/OrdersPage';
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import Settings from '@/features/dashboard/pages/Settings';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import ManageProducts from '@/features/admin/pages/ManageProducts';
import ManageOrders from '@/features/admin/pages/ManageOrders';
import ManageUsers from '@/features/admin/pages/ManageUsers';
import SellProducts from '@/features/admin/pages/SellProducts';
import Analytics from '@/features/admin/pages/Analytics';

// Seller pages
import MyShop from '@/features/seller/pages/MyShop';
import MyProducts from '@/features/seller/pages/MyProducts';
import SellerPOS from '@/features/seller/pages/SellerPOS';
import SellerAnalytics from '@/features/seller/pages/SellerAnalytics';

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
  // Public routes (no auth required)
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/products', element: <ProductList /> },
      { path: '/products/:slug', element: <ProductDetail /> },
      // Protected public routes (require login)
      { path: '/cart', element: <ProtectedRoute><Cart /></ProtectedRoute> },
      { path: '/checkout', element: <ProtectedRoute><Checkout /></ProtectedRoute> },
      { path: '/checkout/success', element: <ProtectedRoute><OrderSuccess /></ProtectedRoute> },
      { path: '/orders', element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
    ],
  },

  // Auth routes (no navbar/footer)
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },

  // Dashboard routes — seller only (auth handled by DashboardShell)
  {
    element: <DashboardShell />,
    children: [
      { path: '/dashboard', element: <MyShop /> },
      { path: '/dashboard/my-products', element: <MyProducts /> },
      { path: '/dashboard/sell', element: <SellerPOS /> },
      { path: '/dashboard/my-analytics', element: <SellerAnalytics /> },
      { path: '/dashboard/settings', element: <Settings /> },
    ],
  },

  // Admin routes (auth handled by AdminShell)
  {
    element: <AdminShell />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/sell', element: <SellProducts /> },
      { path: '/admin/products', element: <ManageProducts /> },
      { path: '/admin/orders', element: <ManageOrders /> },
      { path: '/admin/users', element: <ManageUsers /> },
      { path: '/admin/analytics', element: <Analytics /> },
    ],
  },
]);
