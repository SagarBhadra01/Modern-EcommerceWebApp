import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
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
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden border-r border-white/[0.06]">
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-white/[0.02] rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
              <span className="text-black font-bold">M</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Mart<span className="text-white/50">X</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome back to your{' '}
            <span className="text-gradient">premium marketplace</span>
          </h2>
          <p className="text-white/40 mb-8">
            Access your orders, wishlist, and exclusive deals. Over 50,000 customers trust us.
          </p>
          <div className="space-y-4">
            {[
              'Curated products from top brands',
              'Free shipping on orders over $50',
              '30-day hassle-free returns',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white/50" />
                </div>
                <span className="text-sm text-white/40">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to your account</h1>
            <p className="text-sm text-white/40">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-white hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-white/20 bg-black text-white focus:ring-white/30 accent-white"
                />
                <span className="text-sm text-white/40">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-white/50 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-black text-white/30">or continue with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="secondary" leftIcon={<Chrome className="h-4 w-4" />}>
                Google
              </Button>
              <Button variant="secondary" leftIcon={<Github className="h-4 w-4" />}>
                GitHub
              </Button>
            </div>
          </div>

          <p className="mt-8 text-xs text-white/30 text-center">
            Use <strong className="text-white">alex@example.com</strong> to login as admin
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
