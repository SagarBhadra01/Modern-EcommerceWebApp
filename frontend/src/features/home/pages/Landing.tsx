import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import {
  ArrowRight, Truck, Shield, RotateCcw, ChevronDown,
  Laptop, Shirt, Home, Dumbbell, BookOpen, Watch,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/shared/ProductCard';
import { RatingStars } from '@/components/shared/RatingStars';
import { products, categories, testimonials, faqs } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';

const iconMap: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="h-6 w-6" />,
  Shirt: <Shirt className="h-6 w-6" />,
  Home: <Home className="h-6 w-6" />,
  Dumbbell: <Dumbbell className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Watch: <Watch className="h-6 w-6" />,
};

// ═══════════ CUSTOM CURSOR ═══════════
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorScale = useMotionValue(1);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });
  const springScale = useSpring(cursorScale, { stiffness: 400, damping: 30 });

  useEffect(() => {
    const move = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    const grow = () => cursorScale.set(3);
    const shrink = () => cursorScale.set(1);
    window.addEventListener('mousemove', move);
    const interactive = () => document.querySelectorAll('a, button, [data-hover]');
    interactive().forEach((el) => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });
    return () => { window.removeEventListener('mousemove', move); interactive().forEach((el) => { el.removeEventListener('mouseenter', grow); el.removeEventListener('mouseleave', shrink); }); };
  }, [cursorX, cursorY, cursorScale]);

  return (
    <>
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden lg:block" style={{ x: springX, y: springY, scale: springScale, translateX: '-50%', translateY: '-50%' }}>
        <div className="w-8 h-8 rounded-full border border-white/60" />
      </motion.div>
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] hidden lg:block" style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </motion.div>
    </>
  );
};

// ═══════════ MOUSE SPOTLIGHT ═══════════
const Spotlight = () => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 40 });
  const sy = useSpring(my, { stiffness: 40, damping: 40 });
  const bg = useMotionTemplate`radial-gradient(800px circle at ${sx}px ${sy}px, rgba(255,255,255,0.035), transparent 80%)`;
  useEffect(() => { const m = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); }; window.addEventListener('mousemove', m); return () => window.removeEventListener('mousemove', m); }, [mx, my]);
  return <motion.div className="fixed inset-0 pointer-events-none z-0" style={{ background: bg }} />;
};

// ═══════════ MAGNETIC WRAPPER ═══════════
const Magnetic = ({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const handleMouse = useCallback((e: React.MouseEvent) => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * strength); y.set((e.clientY - r.top - r.height / 2) * strength); }, [x, y, strength]);
  const reset = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ x: sx, y: sy }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{children}</motion.div>;
};

// ═══════════ MOUSE PARALLAX HOOK ═══════════
const useMouseParallax = (strength = 20) => {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 50, damping: 40 }); const sy = useSpring(y, { stiffness: 50, damping: 40 });
  useEffect(() => { const m = (e: MouseEvent) => { const cx = window.innerWidth / 2; const cy = window.innerHeight / 2; x.set(((e.clientX - cx) / cx) * strength); y.set(((e.clientY - cy) / cy) * strength); }; window.addEventListener('mousemove', m); return () => window.removeEventListener('mousemove', m); }, [x, y, strength]);
  return { x: sx, y: sy };
};

// ═══════════ FLOATING PARTICLES ═══════════
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 40 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1, dur: Math.random() * 12 + 10, del: Math.random() * 5 })).map((p) => (
      <motion.div key={p.id} className="absolute rounded-full bg-white" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
        animate={{ y: [0, -80, 0], x: [0, Math.random() * 40 - 20, 0], opacity: [0, 0.2, 0] }}
        transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: 'easeInOut' }} />
    ))}
  </div>
);

// ═══════════ 3D TILT CARD ═══════════
const TiltCard3D = ({ children, className = '', intensity = 12 }: { children: React.ReactNode; className?: string; intensity?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0); const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 300, damping: 25 }); const sry = useSpring(ry, { stiffness: 300, damping: 25 });
  const glowX = useMotionValue(50); const glowY = useMotionValue(50);
  const glowBg = useMotionTemplate`radial-gradient(400px circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.08), transparent 70%)`;
  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width; const cy = (e.clientY - r.top) / r.height;
    ry.set((cx - 0.5) * intensity); rx.set(-(cy - 0.5) * intensity);
    glowX.set(cx * 100); glowY.set(cy * 100);
  }, [rx, ry, glowX, glowY, intensity]);
  const reset = useCallback(() => { rx.set(0); ry.set(0); glowX.set(50); glowY.set(50); }, [rx, ry, glowX, glowY]);
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ rotateX: srx, rotateY: sry, transformPerspective: 800, transformStyle: 'preserve-3d' }} className={className}>
      <motion.div className="absolute inset-0 rounded-xl pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: glowBg }} />
      {children}
    </motion.div>
  );
};

// ═══════════ LETTER-BY-LETTER TEXT REVEAL ═══════════
const TextReveal = ({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const words = text.split(' ');
  return (
    <span ref={ref} className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', rotateX: -90 }}
            animate={inView ? { y: '0%', rotateX: 0 } : {}}
            transition={{ duration: 0.6, delay: delay + wi * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom center' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// ═══════════ ANIMATED SECTION HEADER ═══════════
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="text-center mb-14">
      <motion.div initial={{ width: 0 }} animate={inView ? { width: 60 } : {}} transition={{ duration: 0.5, ease: 'easeOut' }} className="h-px bg-white/30 mx-auto mb-6" />
      <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl sm:text-5xl font-bold text-white">
        {title}
      </motion.h2>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.25 }} className="text-white/40 mt-3 text-lg">
        {subtitle}
      </motion.p>
    </div>
  );
};

// ═══════════ ANIMATED COUNTER ═══════════
const AnimatedCounter = ({ value }: { value: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.span ref={ref} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="text-3xl sm:text-5xl font-bold text-white block">
      {value}
    </motion.span>
  );
};

// ═══════════ HORIZONTAL SCROLLING MARQUEE ═══════════
const Marquee = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden py-8 relative">
    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
    <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="flex gap-8 whitespace-nowrap">
      {children}{children}
    </motion.div>
  </div>
);

// ═══════════════════════════════════════════════════
// ═══════════ LANDING PAGE ═════════════════════════
// ═══════════════════════════════════════════════════
const Landing = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroRotateX = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const p1 = useMouseParallax(30);
  const p2 = useMouseParallax(15);
  const p3 = useMouseParallax(8);

  const trendingProducts = products.slice(0, 6);
  const handleWishlistToggle = (id: string) => setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  return (
    <div className="overflow-hidden" style={{ cursor: 'none' }}>
      <CustomCursor />
      <Spotlight />

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center overflow-hidden" style={{ perspective: '1200px' }}>
        <FloatingParticles />

        {/* Animated background layers */}
        <div className="absolute inset-0">
          {/* Primary orb */}
          <motion.div style={{ x: p1.x, y: p1.y }} animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.09, 0.04] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-white rounded-full blur-[150px]" />
          {/* Secondary orb */}
          <motion.div style={{ x: p2.x, y: p2.y }} animate={{ scale: [1.2, 1, 1.2], opacity: [0.02, 0.07, 0.02] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-white rounded-full blur-[120px]" />
          {/* Third orb */}
          <motion.div style={{ x: p3.x, y: p3.y }} animate={{ scale: [1, 1.4, 1], opacity: [0.01, 0.04, 0.01], rotate: [0, 180, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-white rounded-full blur-[80px]" />
          {/* Animated grid */}
          <motion.div animate={{ opacity: [0.02, 0.04, 0.02] }} transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale, rotateX: heroRotateX }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-40 relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Announcement */}
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center mb-10">
              <Magnetic>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-white/50" />
                  <span>New arrivals just dropped</span>
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/40">→</motion.span>
                </div>
              </Magnetic>
            </motion.div>

            {/* Hero title — letter by letter 3D reveal */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.0] tracking-tight mb-8" style={{ perspective: '600px' }}>
              <TextReveal text="Discover Products" delay={0.3} />
              <br />
              <TextReveal text="That" delay={0.5} />
              {' '}
              <motion.span
                className="inline-block bg-gradient-to-r from-white via-white/70 to-white/40 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                <TextReveal text="Define Quality" delay={0.6} />
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9 }} className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-12">
              Curated marketplace featuring premium products from world-class brands. Free shipping on every order over $50.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.1 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/products">
                <Magnetic strength={0.4}>
                  <Button size="lg" rightIcon={<motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight className="h-5 w-5" /></motion.span>}>
                    Shop Now
                  </Button>
                </Magnetic>
              </Link>
              <Link to="/products">
                <Magnetic strength={0.4}>
                  <Button variant="ghost" size="lg">Browse Categories</Button>
                </Magnetic>
              </Link>
            </motion.div>

            {/* Stats — 3D pop-in */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[{ label: 'Products', value: '2,000+' }, { label: 'Happy Customers', value: '50K+' }, { label: 'Countries', value: '50+' }].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 40, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 1.3 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative" style={{ transformPerspective: 600 }}>
                  <AnimatedCounter value={stat.value} />
                  <p className="text-xs text-white/30 mt-1">{stat.label}</p>
                  {i < 2 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-white/10 hidden sm:block" />}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
            <motion.div animate={{ height: [8, 16, 8], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="w-1 rounded-full bg-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ MARQUEE STRIP ═══════════ */}
      <section className="border-y border-white/[0.04]">
        <Marquee>
          {['✦ Free Shipping', '✦ Premium Quality', '✦ 30-Day Returns', '✦ Secure Checkout', '✦ 50K+ Customers', '✦ Worldwide Delivery', '✦ Best Prices', '✦ Curated Selection'].map((t) => (
            <span key={t} className="text-sm font-medium text-white/20 tracking-wider uppercase">{t}</span>
          ))}
        </Marquee>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <SectionHeader title="Shop by Category" subtitle="Find exactly what you need" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={{ hidden: { opacity: 0, y: 40, rotateX: -20 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }} style={{ transformPerspective: 600 }}>
              <TiltCard3D className="h-full group" intensity={15}>
                <Link to={`/products?category=${cat.slug}`} className="relative bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 flex flex-col items-center gap-3 hover:border-white/[0.15] transition-all duration-500 overflow-hidden h-full">
                  <motion.div whileHover={{ scale: 1.3, rotate: 15, y: -4 }} transition={{ type: 'spring', stiffness: 300 }} className="text-white/50 group-hover:text-white transition-colors duration-300 relative z-10">
                    {iconMap[cat.icon] || <Laptop className="h-6 w-6" />}
                  </motion.div>
                  <span className="text-sm font-medium text-white relative z-10">{cat.name}</span>
                  <span className="text-xs text-white/30 relative z-10">{cat.count} items</span>
                </Link>
              </TiltCard3D>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ TRENDING PRODUCTS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="flex items-end justify-between mb-12">
          <div>
            <motion.div initial={{ width: 0 }} whileInView={{ width: 40 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="h-px bg-white/30 mb-4" />
            <h2 className="text-3xl sm:text-5xl font-bold text-white">Trending Now</h2>
            <p className="text-white/40 mt-2 text-lg">Most popular picks this week</p>
          </div>
          <Link to="/products" className="group text-sm font-medium text-white/40 hover:text-white flex items-center gap-2 transition-all duration-300">
            View All
            <motion.span className="group-hover:translate-x-1 transition-transform"><ArrowRight className="h-4 w-4" /></motion.span>
          </Link>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {trendingProducts.map((product, i) => (
            <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 60, rotateY: -5 }, visible: { opacity: 1, y: 0, rotateY: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }} style={{ transformPerspective: 1000 }}>
              <ProductCard product={product} isWishlisted={wishlist.includes(product.id)} onAddToCart={(id) => { const p = products.find((p) => p.id === id); if (p) addItem(p); }} onWishlistToggle={handleWishlistToggle} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <SectionHeader title="Why Choose Us" subtitle="Premium experience, guaranteed" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { icon: <Truck className="h-8 w-8" />, title: 'Free Shipping', desc: 'Free shipping on all orders over $50. Fast delivery guaranteed within 5-7 business days.' },
            { icon: <Shield className="h-8 w-8" />, title: 'Secure Payments', desc: 'Your payment information is encrypted and secure. We accept all major payment methods.' },
            { icon: <RotateCcw className="h-8 w-8" />, title: 'Easy Returns', desc: '30-day hassle-free return policy. Not satisfied? Get a full refund, no questions asked.' },
          ].map((benefit) => (
            <motion.div key={benefit.title} variants={{ hidden: { opacity: 0, y: 50, scale: 0.9, rotateX: -15 }, visible: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }} style={{ transformPerspective: 800 }}>
              <TiltCard3D className="h-full group" intensity={10}>
                <div className="text-center p-8 rounded-2xl bg-[#0A0A0A] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 h-full relative overflow-hidden">
                  <motion.div whileHover={{ scale: 1.2, rotateZ: -10, y: -6 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 text-white/50 group-hover:text-white group-hover:bg-white/10 mb-5 transition-all duration-300 relative z-10">
                    {benefit.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2 relative z-10">{benefit.title}</h3>
                  <p className="text-sm text-white/40 relative z-10">{benefit.desc}</p>
                </div>
              </TiltCard3D>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <SectionHeader title="What Customers Say" subtitle="Real reviews from real people" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div key={t.id} variants={{ hidden: { opacity: 0, y: 50, rotateX: -10 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }} style={{ transformPerspective: 800 }}>
              <TiltCard3D className="h-full group" intensity={8}>
                <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 space-y-4 hover:border-white/[0.15] transition-all duration-500 h-full relative overflow-hidden">
                  <RatingStars rating={t.rating} />
                  <p className="text-sm text-white/50 leading-relaxed italic relative z-10">"{t.quote}"</p>
                  <div className="flex items-center gap-3 relative z-10">
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center text-sm font-bold">
                      {t.name.split(' ').map((n) => n[0]).join('')}
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-white/30">{t.role}</p>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <SectionHeader title="Frequently Asked" subtitle="Got questions? We have answers" />
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={faq.id} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}
              className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] transition-all duration-300 group">
              <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex items-center justify-between p-5 text-left" data-hover>
                <span className="text-sm font-medium text-white group-hover:text-white/90">{faq.question}</span>
                <motion.div animate={{ rotate: openFaq === faq.id ? 180 : 0, scale: openFaq === faq.id ? 1.2 : 1 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="h-4 w-4 text-white/30" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === faq.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <p className="px-5 pb-5 text-sm text-white/40 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <motion.div initial={{ opacity: 0, scale: 0.95, rotateX: -5 }} whileInView={{ opacity: 1, scale: 1, rotateX: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden border border-white/[0.06]" style={{ transformPerspective: 1000 }}>
          {/* Animated gradient mesh bg */}
          <motion.div animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)', backgroundSize: '200% 200%' }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative px-8 py-24 text-center">
            <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/5 mb-8">
              <Sparkles className="h-7 w-7 text-white/50" />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Ready to Start Shopping?
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="text-white/40 mb-12 max-w-md mx-auto text-lg">
              Join over 50,000 happy customers and discover curated products you will love.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Link to="/products">
                <Magnetic strength={0.5}>
                  <Button size="lg" rightIcon={<motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight className="h-5 w-5" /></motion.span>}>
                    Explore Products
                  </Button>
                </Magnetic>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
