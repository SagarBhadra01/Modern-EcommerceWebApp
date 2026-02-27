import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import { Mail, Lock, Github, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const formContainerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setLoading(true);
    setTimeout(() => {
      const result = signIn(data.email, data.password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left brand panel */}
      <div ref={leftPanelRef} className="hidden lg:flex lg:w-[45%] relative overflow-hidden border-r border-white/[0.08] opacity-0">
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          {/* Subtle noise overlay */}
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
            ].map((item, i) => (
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

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          ref={formContainerRef}
          className="w-full max-w-sm opacity-0"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Sign in</h1>
            <p className="text-base text-white/40">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-white hover:text-white/80 font-medium transition-colors" data-hover>
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group" data-hover>
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-white/20 bg-black text-white focus:ring-white/30 accent-white transition-all cursor-pointer"
                />
                <span className="text-sm text-white/50 group-hover:text-white transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-white/50 hover:text-white font-medium transition-colors" data-hover>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Sign In
            </Button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-black text-white/40 font-medium tracking-widest uppercase">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="secondary" leftIcon={<Chrome className="h-4 w-4" />} data-hover className="bg-[#050505] hover:bg-white/5 border-white/[0.1]">
                Google
              </Button>
              <Button variant="secondary" leftIcon={<Github className="h-4 w-4" />} data-hover className="bg-[#050505] hover:bg-white/5 border-white/[0.1]">
                GitHub
              </Button>
            </div>
          </div>

          <div className="mt-12 p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl text-center">
            <p className="text-sm text-white/40">
              Use <strong className="text-white font-medium">alex@example.com</strong> to login as admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
