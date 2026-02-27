import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const OrderSuccess = () => {
  const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-success/10 mb-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CheckCircle className="h-12 w-12 text-success" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-3">Order Confirmed!</h1>
        <p className="text-white/40 mb-2">Thank you for your purchase.</p>
        <p className="text-sm text-white/40 mb-2">
          Order number: <span className="font-mono text-white">{orderId}</span>
        </p>
        <p className="text-sm text-white/40 mb-8">
          A confirmation email has been sent to your email address.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard/orders">
            <Button leftIcon={<Package className="h-4 w-4" />}>
              Track Order
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
