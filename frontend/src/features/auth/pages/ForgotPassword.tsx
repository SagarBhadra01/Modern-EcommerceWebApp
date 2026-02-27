import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const successIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (submitted && successIconRef.current) {
      gsap.fromTo(successIconRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.6, ease: 'back.out(1.5)' }
      );
    }
  }, [submitted]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      // Run the exit for the form inside standard React render cycle, handled by the state change
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-black to-black relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
      
      <div
        ref={containerRef}
        className="w-full max-w-sm relative z-10 opacity-0"
      >
        <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Lock className="h-5 w-5 text-white/60" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">Forgot password?</h1>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div
                ref={successIconRef}
                className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success/10 mb-6 border border-success/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
              >
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Check your email</h2>
              <p className="text-sm text-white/50 mb-6 leading-relaxed font-light px-4">
                We've sent a password reset link to your email address. Please check your inbox.
              </p>
              <Button variant="secondary" fullWidth onClick={() => setSubmitted(false)}>
                Try another email
              </Button>
            </div>
          )}
        </div>

        <Link
          to="/login"
          data-hover
          className="flex items-center justify-center gap-2 mt-8 text-sm font-medium text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
