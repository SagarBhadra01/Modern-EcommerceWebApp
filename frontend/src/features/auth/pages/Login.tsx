import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import gsap from 'gsap';

const Login = () => {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      if (leftPanelRef.current) {
        tl.fromTo(leftPanelRef.current, 
          { opacity: 0, x: -50 }, 
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
        );
      }
      
      if (formContainerRef.current) {
        tl.fromTo(formContainerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          leftPanelRef.current ? '-=0.3' : 0
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left brand panel */}
      <div ref={leftPanelRef} className="hidden lg:flex lg:w-[45%] relative overflow-hidden border-r border-white/[0.08] opacity-0">
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <Link to="/" className="flex items-center gap-3 mb-16" data-hover>
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <span className="text-black font-black text-xl">M</span>
            </div>
            <span className="text-3xl font-black text-white tracking-tight">
              Mart<span className="text-white/40">X</span>
            </span>
          </Link>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
            Welcome back to your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">premium marketplace</span>
          </h2>
          <p className="text-lg text-white/50 mb-12 font-light leading-relaxed">
            Access your orders, wishlist, and exclusive deals. Over 50,000 customers trust us daily.
          </p>
          <div className="space-y-6">
            {[
              'Curated products from top brands',
              'Free shipping on orders over $50',
              '30-day hassle-free returns',
            ].map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  <div className="h-2 w-2 rounded-full bg-white/80" />
                </div>
                <span className="text-base text-white/50 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel — Clerk SignIn */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div ref={formContainerRef} className="opacity-0">
          <SignIn
            routing="hash"
            signUpUrl="/register"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
