import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, ArrowUpRight, Truck, Shield, RotateCcw, ChevronDown, Star,
  Laptop, Shirt, Home as HomeIcon, Dumbbell, BookOpen, Watch, Sparkles, Zap, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/shared/ProductCard';
import { products, categories, testimonials, faqs } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="h-7 w-7" />,
  Shirt: <Shirt className="h-7 w-7" />,
  Home: <HomeIcon className="h-7 w-7" />,
  Dumbbell: <Dumbbell className="h-7 w-7" />,
  BookOpen: <BookOpen className="h-7 w-7" />,
  Watch: <Watch className="h-7 w-7" />,
};

// ═══════════════════════════════════════════════════════════════
// ═══════════ LANDING PAGE ════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
const Landing = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const containerRef = useRef<HTMLDivElement>(null);
  const trendingProducts = products.slice(0, 6);

  const handleWishlistToggle = (id: string) =>
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  // ─── GSAP Animations ──────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {

      // ═══ 3D HERO Intro Timeline ═══
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });

      hero
        .fromTo('.hero-title',
          { opacity: 0, scale: 0.5, z: -500, rotationX: -30 },
          { opacity: 1, scale: 1, z: 100, rotationX: 0, duration: 1.5 })
        .fromTo('.hero-badge',
          { opacity: 0, y: 30, z: -100 },
          { opacity: 1, y: 0, z: 50, duration: 1 }, "-=1")
        .fromTo('.hero-desc',
          { opacity: 0, y: 30, z: -100 },
          { opacity: 1, y: 0, z: 80, duration: 1 }, "-=0.8")
        .fromTo('.hero-cta',
          { opacity: 0, scale: 0.8, z: -100 },
          { opacity: 1, scale: 1, z: 60, duration: 0.8 }, "-=0.8")
        .fromTo('.hero-float-card',
          { opacity: 0, scale: 0, z: -800 },
          { opacity: 1, scale: 1, duration: 1.5, stagger: 0.2, ease: "back.out(1.2)" }, "-=1.5");

      // Continuous rotation of the floating cards for extra dynamism
      gsap.to('.hero-float-card', {
        rotationY: '+=10',
        rotationX: '+=5',
        yoyo: true,
        repeat: -1,
        duration: 4,
        ease: 'sine.inOut',
        stagger: 0.5
      });

      // ═══ STATS TICKER — scroll-triggered count up ═══
      gsap.fromTo('.stats-section', { opacity: 0 }, {
        scrollTrigger: { trigger: '.stats-section', start: 'top 90%' },
        opacity: 1, duration: 0.6,
      });
      gsap.fromTo('.stat-item', { y: 40, opacity: 0, rotationX: -20 }, {
        scrollTrigger: { trigger: '.stats-section', start: 'top 85%' },
        y: 0, opacity: 1, rotationX: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.5)',
      });

      // ═══ CATEGORIES — 3D grid reveal ═══
      gsap.fromTo('.cat-title-line', { scaleX: 0 }, {
        scrollTrigger: { trigger: '.cat-section', start: 'top 80%' },
        scaleX: 1, duration: 0.6,
      });
      gsap.fromTo('.cat-title', { y: 40, opacity: 0 }, {
        scrollTrigger: { trigger: '.cat-section', start: 'top 80%' },
        y: 0, opacity: 1, duration: 0.6, delay: 0.15,
      });
      gsap.fromTo('.cat-card', { y: 80, opacity: 0, rotationY: -15, scale: 0.9 }, {
        scrollTrigger: { trigger: '.cat-grid', start: 'top 85%' },
        y: 0, opacity: 1, rotationY: 0, scale: 1,
        duration: 0.8, stagger: { amount: 0.5 }, ease: 'power3.out',
      });

      // ═══ PRODUCTS — cascade reveal ═══
      gsap.fromTo('.prod-title-line', { scaleX: 0 }, {
        scrollTrigger: { trigger: '.prod-section', start: 'top 80%' },
        scaleX: 1, duration: 0.6,
      });
      gsap.fromTo('.prod-heading', { y: 40, opacity: 0 }, {
        scrollTrigger: { trigger: '.prod-section', start: 'top 80%' },
        y: 0, opacity: 1, duration: 0.6, delay: 0.15,
      });
      gsap.fromTo('.prod-card', { y: 100, opacity: 0, rotationX: -12 }, {
        scrollTrigger: { trigger: '.prod-grid', start: 'top 85%' },
        y: 0, opacity: 1, rotationX: 0,
        duration: 0.8, stagger: { amount: 0.6, from: 'start' }, ease: 'power3.out',
      });

      // ═══ BENEFITS — staggered stack ═══
      gsap.fromTo('.benefit-title-line', { scaleX: 0 }, {
        scrollTrigger: { trigger: '.benefit-section', start: 'top 80%' },
        scaleX: 1, duration: 0.6,
      });
      gsap.fromTo('.benefit-heading', { y: 40, opacity: 0 }, {
        scrollTrigger: { trigger: '.benefit-section', start: 'top 80%' },
        y: 0, opacity: 1, duration: 0.6, delay: 0.15,
      });
      gsap.fromTo('.benefit-card', { x: -60, opacity: 0, rotationY: -8 }, {
        scrollTrigger: { trigger: '.benefit-grid', start: 'top 85%' },
        x: 0, opacity: 1, rotationY: 0,
        duration: 0.7, stagger: 0.15, ease: 'power3.out',
      });

      // ═══ TESTIMONIALS — 3D card flip ═══
      gsap.fromTo('.test-title-line', { scaleX: 0 }, {
        scrollTrigger: { trigger: '.test-section', start: 'top 80%' },
        scaleX: 1, duration: 0.6,
      });
      gsap.fromTo('.test-heading', { y: 40, opacity: 0 }, {
        scrollTrigger: { trigger: '.test-section', start: 'top 80%' },
        y: 0, opacity: 1, duration: 0.6, delay: 0.15,
      });
      gsap.fromTo('.test-card', { y: 70, opacity: 0, rotationX: -20, scale: 0.9 }, {
        scrollTrigger: { trigger: '.test-grid', start: 'top 85%' },
        y: 0, opacity: 1, rotationX: 0, scale: 1,
        duration: 0.8, stagger: 0.12, ease: 'back.out(1.3)',
      });

      // ═══ FAQ — slide in ═══
      gsap.fromTo('.faq-title-line', { scaleX: 0 }, {
        scrollTrigger: { trigger: '.faq-section', start: 'top 80%' },
        scaleX: 1, duration: 0.6,
      });
      gsap.fromTo('.faq-heading', { y: 40, opacity: 0 }, {
        scrollTrigger: { trigger: '.faq-section', start: 'top 80%' },
        y: 0, opacity: 1, duration: 0.6, delay: 0.15,
      });
      gsap.fromTo('.faq-item', { x: (i: number) => i % 2 === 0 ? -50 : 50, opacity: 0 }, {
        scrollTrigger: { trigger: '.faq-list', start: 'top 85%' },
        x: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out',
      });

      // ═══ CTA — dramatic entrance ═══
      gsap.fromTo('.cta-box', { scale: 0.88, opacity: 0, rotationX: -10 }, {
        scrollTrigger: { trigger: '.cta-box', start: 'top 85%' },
        scale: 1, opacity: 1, rotationX: 0, duration: 1, ease: 'power3.out',
      });
      gsap.fromTo('.cta-icon', { scale: 0, rotation: -180 }, {
        scrollTrigger: { trigger: '.cta-box', start: 'top 80%' },
        scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2.5)', delay: 0.2,
      });
      gsap.fromTo('.cta-text', { y: 30, opacity: 0 }, {
        scrollTrigger: { trigger: '.cta-box', start: 'top 80%' },
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3,
      });

      // ═══ MOUSE 3D PARALLAX ═══
      const onMouse = (e: MouseEvent) => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const normY = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

        // Tilt the entire hero container
        gsap.to('.hero-3d-container', {
          rotationX: -normY * 15,
          rotationY: normX * 15,
          duration: 1,
          ease: "power2.out"
        });

        // Move the floating cards for extra parallax
        gsap.to('.hero-float-card', {
          x: `+=${normX * 10}`,
          y: `+=${normY * 10}`,
          duration: 1.5,
          ease: "power2.out",
        });

        // Move background orbs
        gsap.to('.bg-orb-1', { x: normX * 40, y: normY * 40, duration: 1.5, ease: 'power2.out' });
        gsap.to('.bg-orb-2', { x: normX * -30, y: normY * -30, duration: 1.8, ease: 'power2.out' });
      };
      window.addEventListener('mousemove', onMouse, { passive: true });

      // Continuous orb breathing
      gsap.to('.bg-orb-1', { scale: 1.2, opacity: 0.07, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.bg-orb-2', { scale: 1.15, opacity: 0.05, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3 });

      return () => window.removeEventListener('mousemove', onMouse);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ─── FAQ toggle with GSAP ───
  const toggleFaq = (id: string) => {
    if (openFaq === id) {
      const el = document.querySelector(`[data-faq="${id}"]`);
      if (el) gsap.to(el, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => setOpenFaq(null) });
    } else {
      setOpenFaq(id);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-faq="${id}"]`);
        if (el) {
          gsap.set(el, { height: 'auto', opacity: 1 });
          gsap.from(el, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.out' });
        }
      });
    }
  };

  return (
    <div ref={containerRef} className="bg-black text-white overflow-hidden" style={{ cursor: 'none' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-orb-1 absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-white/[0.04] rounded-full blur-[100px]" />
        <div className="bg-orb-2 absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[80px]" />
      </div>

      {/* ═══════════ 3D HERO ═══════════ */}
      <section className="hero-section relative min-h-[100vh] flex items-center justify-center overflow-hidden" style={{ perspective: 1200 }}>
        {/* 3D Container responsive to mouse */}
        <div className="hero-3d-container w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center h-full" style={{ transformStyle: 'preserve-3d' }}>
          
          {/* Floating 3D Cards */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
             <div className="hero-float-card absolute w-64 h-80 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-md flex items-center justify-center opacity-0" 
                  style={{ transform: 'translate3d(-350px, -150px, -200px) rotateY(15deg) rotateX(10deg)' }}>
                <Laptop className="h-20 w-20 text-white/20" />
             </div>
             <div className="hero-float-card absolute w-56 h-72 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-md flex items-center justify-center opacity-0" 
                  style={{ transform: 'translate3d(400px, 50px, -100px) rotateY(-20deg) rotateX(-5deg)' }}>
                <Watch className="h-16 w-16 text-white/20" />
             </div>
             <div className="hero-float-card absolute w-48 h-64 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-md flex items-center justify-center opacity-0" 
                  style={{ transform: 'translate3d(-50px, 200px, -300px) rotateX(20deg)' }}>
                <Shirt className="h-14 w-14 text-white/20" />
             </div>
          </div>

          {/* Center Title */}
          <div className="relative text-center z-20" style={{ transformStyle: 'preserve-3d' }}>
            <div className="hero-badge inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm text-white/70 backdrop-blur-md mb-8 opacity-0" data-hover>
              <Sparkles className="h-4 w-4 text-white/50" />
              <span className="tracking-widest uppercase text-xs font-semibold">The Future of Commerce</span>
            </div>

            <h1 className="hero-title text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-white opacity-0">
              ELEVATE <br />
              <span className="bg-gradient-to-r from-white via-white/50 to-transparent bg-clip-text text-transparent">YOUR LIFESTYLE</span>
            </h1>

            <p className="hero-desc text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mt-8 mb-12 opacity-0">
              Immersive shopping experience with cutting-edge 3D interactions.
              Discover premium products in a modern, dynamic environment.
            </p>

            <div className="hero-cta flex flex-wrap justify-center gap-4 opacity-0">
              <Link to="/products">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} className="bg-white text-black hover:bg-white/90" data-hover>
                  Start Exploring
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="ghost" size="lg" className="border border-white/10 hover:bg-white/5 border-white/20" data-hover>
                  View Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="stats-section border-y border-white/[0.06] opacity-0 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '2,000+', label: 'Curated Products', icon: <Sparkles className="h-5 w-5" /> },
              { num: '50K+', label: 'Happy Customers', icon: <Star className="h-5 w-5" /> },
              { num: '50+', label: 'Countries Served', icon: <Globe className="h-5 w-5" /> },
              { num: '99%', label: 'Satisfaction Rate', icon: <Zap className="h-5 w-5" /> },
            ].map((s) => (
              <div key={s.label} className="stat-item flex items-start gap-4 opacity-0" style={{ perspective: 600 }}>
                <div className="p-2.5 rounded-lg bg-white/[0.04] text-white/30">{s.icon}</div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{s.num}</div>
                  <div className="text-xs text-white/30 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="cat-section max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28 relative z-10">
        <div className="cat-title-line h-px bg-white/10 mb-8 origin-left" style={{ transform: 'scaleX(0)' }} />
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="cat-title text-xs uppercase tracking-[0.3em] text-white/30 mb-3 opacity-0">Browse</p>
            <h2 className="cat-title text-4xl sm:text-6xl font-bold tracking-tight text-white opacity-0">Categories</h2>
          </div>
          <Link to="/products" className="cat-title text-sm text-white/30 hover:text-white transition-colors flex items-center gap-1 opacity-0" data-hover>
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="cat-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" style={{ perspective: 1000 }}>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} data-hover
              className="cat-card group relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 opacity-0 block">
              <div className="text-white/30 group-hover:text-white transition-colors duration-300 mb-3">
                {iconMap[cat.icon] || <Laptop className="h-7 w-7" />}
              </div>
              <h3 className="text-sm font-semibold text-white mb-0.5">{cat.name}</h3>
              <p className="text-xs text-white/25">{cat.count} items</p>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-white/0 group-hover:text-white/30 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ PRODUCTS ═══════════ */}
      <section className="prod-section max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28 relative z-10">
        <div className="prod-title-line h-px bg-white/10 mb-8 origin-left" style={{ transform: 'scaleX(0)' }} />
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="prod-heading text-xs uppercase tracking-[0.3em] text-white/30 mb-3 opacity-0">Featured</p>
            <h2 className="prod-heading text-4xl sm:text-6xl font-bold tracking-tight text-white opacity-0">Trending Now</h2>
          </div>
          <Link to="/products" className="prod-heading text-sm text-white/30 hover:text-white transition-colors flex items-center gap-1 opacity-0" data-hover>
            Shop all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="prod-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ perspective: 1200 }}>
          {trendingProducts.map((product) => (
            <div key={product.id} className="prod-card opacity-0" data-hover>
              <ProductCard product={product} isWishlisted={wishlist.includes(product.id)}
                onAddToCart={(id) => { const p = products.find((pr) => pr.id === id); if (p) addItem(p); }}
                onWishlistToggle={handleWishlistToggle} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="benefit-section max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28 relative z-10">
        <div className="benefit-title-line h-px bg-white/10 mb-8 origin-left" style={{ transform: 'scaleX(0)' }} />
        <div className="mb-14">
          <p className="benefit-heading text-xs uppercase tracking-[0.3em] text-white/30 mb-3 opacity-0">Why us</p>
          <h2 className="benefit-heading text-4xl sm:text-6xl font-bold tracking-tight text-white opacity-0">Built Different</h2>
        </div>
        <div className="benefit-grid space-y-4" style={{ perspective: 1000 }}>
          {[
            { icon: <Truck className="h-6 w-6" />, title: 'Free Shipping', desc: 'Complimentary shipping on all orders over $50. Delivered within 5-7 business days worldwide.', num: '01' },
            { icon: <Shield className="h-6 w-6" />, title: 'Secure Payments', desc: 'Bank-grade encryption protects every transaction. All major cards and digital wallets accepted.', num: '02' },
            { icon: <RotateCcw className="h-6 w-6" />, title: 'Easy Returns', desc: '30-day no-questions-asked return policy. Full refund guarantee on every purchase.', num: '03' },
          ].map((b) => (
            <div key={b.title} className="benefit-card group flex items-start gap-6 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 opacity-0" data-hover>
              <span className="text-5xl font-bold text-white/[0.06] select-none leading-none">{b.num}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-white/40 group-hover:text-white transition-colors duration-300">{b.icon}</div>
                  <h3 className="text-lg font-semibold text-white">{b.title}</h3>
                </div>
                <p className="text-sm text-white/35 leading-relaxed max-w-lg">{b.desc}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-white/0 group-hover:text-white/20 transition-all duration-300 mt-1" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="test-section max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28 relative z-10">
        <div className="test-title-line h-px bg-white/10 mb-8 origin-left" style={{ transform: 'scaleX(0)' }} />
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="test-heading text-xs uppercase tracking-[0.3em] text-white/30 mb-3 opacity-0">Praise</p>
            <h2 className="test-heading text-4xl sm:text-6xl font-bold tracking-tight text-white opacity-0">What They Say</h2>
          </div>
        </div>
        <div className="test-grid grid grid-cols-1 md:grid-cols-3 gap-5" style={{ perspective: 1000 }}>
          {testimonials.map((t) => (
            <div key={t.id} className="test-card p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 space-y-5 opacity-0" data-hover>
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? 'fill-white/70 text-white/70' : 'text-white/10'}`} />
                ))}
              </div>
              <p className="text-sm text-white/45 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
                <div className="h-9 w-9 rounded-full bg-white/[0.06] text-white/60 flex items-center justify-center text-xs font-bold">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{t.name}</p>
                  <p className="text-xs text-white/25">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="faq-section max-w-3xl mx-auto px-6 sm:px-12 py-28 relative z-10">
        <div className="faq-title-line h-px bg-white/10 mb-8 origin-left" style={{ transform: 'scaleX(0)' }} />
        <p className="faq-heading text-xs uppercase tracking-[0.3em] text-white/30 mb-3 opacity-0">Support</p>
        <h2 className="faq-heading text-4xl sm:text-6xl font-bold tracking-tight text-white mb-14 opacity-0">FAQ</h2>
        <div className="faq-list space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="faq-item border border-white/[0.05] rounded-xl overflow-hidden hover:border-white/[0.1] transition-all duration-300 opacity-0">
              <button onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left group" data-hover>
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{faq.question}</span>
                <ChevronDown className={`h-4 w-4 text-white/25 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === faq.id && (
                <div data-faq={faq.id}>
                  <p className="px-5 pb-5 text-sm text-white/35 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28 relative z-10">
        <div className="cta-box relative rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02] opacity-0" style={{ perspective: 1200 }}>
          {/* Grid bg */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="relative px-8 sm:px-16 py-20 sm:py-28 text-center" style={{ transformStyle: 'preserve-3d' }}>
            <div className="cta-icon inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/[0.05] mb-8">
              <Sparkles className="h-6 w-6 text-white/40" />
            </div>
            <h2 className="cta-text text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5 opacity-0">
              Start Shopping Today
            </h2>
            <p className="cta-text text-white/35 mb-10 max-w-md mx-auto text-lg opacity-0">
              Join 50,000+ customers who discovered products they love.
            </p>
            <div className="cta-text opacity-0">
              <Link to="/products">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} data-hover>Explore Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
