import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const OrderSuccess = () => {
  const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const iconBgRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from(iconBgRef.current, { scale: 0, duration: 0.6, ease: 'back.out(1.5)' })
        .from(iconRef.current, { scale: 0, opacity: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.2')
        .from(containerRef.current, { opacity: 0, y: 30, duration: 0.5, ease: 'power2.out' }, '-=0.2');
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center flex flex-col items-center">
      <div
        ref={iconBgRef}
        className="inline-flex items-center justify-center p-8 rounded-full bg-success/10 mb-8 border border-success/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
      >
        <div ref={iconRef}>
          <CheckCircle className="h-16 w-16 text-success" />
        </div>
      </div>

      <div ref={containerRef} className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Order Confirmed!</h1>
          <p className="text-lg text-white/60 mb-2 font-light">Thank you for your purchase.</p>
        </div>
        
        <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-white/40 mb-2">Order number</p>
          <p className="font-mono text-xl font-bold text-white tracking-widest">{orderId}</p>
        </div>
        
        <p className="text-sm text-white/50 mb-10">
          A confirmation and receipt has been sent to your email address.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard/orders" className="w-full sm:w-auto" data-hover>
            <Button size="lg" fullWidth leftIcon={<Package className="h-5 w-5" />} className="shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Track Order
            </Button>
          </Link>
          <Link to="/products" className="w-full sm:w-auto" data-hover>
            <Button size="lg" fullWidth variant="secondary" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
