import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    setLoading(true);
    setTimeout(() => {
      login({
        id: 'new-' + Date.now(),
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: 'user',
        joinedAt: new Date().toISOString(),
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left brand panel */}
      <div ref={leftPanelRef} className="hidden lg:flex lg:w-[45%] relative overflow-hidden border-r border-white/[0.08] opacity-0">
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />
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
            Join the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">MartX community</span>
          </h2>
          <p className="text-lg text-white/50 font-light leading-relaxed">
            Create your account and start shopping premium curated products today. Experience the future of e-commerce.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          ref={formContainerRef}
          className="w-full max-w-sm opacity-0"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Create account</h1>
            <p className="text-base text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-white/80 font-medium transition-colors" data-hover>
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
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
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <label className="flex items-start gap-3 cursor-pointer group mt-6" data-hover>
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="h-4 w-4 mt-0.5 rounded border-white/20 bg-black text-white focus:ring-white/30 accent-white transition-all cursor-pointer"
              />
              <span className="text-sm text-white/50 leading-tight group-hover:text-white transition-colors">
                I agree to the{' '}
                <a href="#" className="text-white hover:text-white/80 font-medium underline underline-offset-2">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-white hover:text-white/80 font-medium underline underline-offset-2">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-danger mt-1">{errors.agreeTerms.message}</p>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
