import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
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
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden border-r border-white/[0.06]">
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-white/[0.03] rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-white/[0.02] rounded-full blur-[100px]" />
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
            Join the{' '}
            <span className="text-gradient">MartX community</span>
          </h2>
          <p className="text-white/40">
            Create your account and start shopping premium curated products today.
          </p>
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
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-sm text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="h-4 w-4 mt-0.5 rounded border-white/20 bg-black text-white focus:ring-white/30 accent-white"
              />
              <span className="text-sm text-white/40">
                I agree to the{' '}
                <a href="#" className="text-white hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-white hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-danger">{errors.agreeTerms.message}</p>
            )}

            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
