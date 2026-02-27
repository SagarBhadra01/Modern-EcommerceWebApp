import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  product: [
    { label: 'Features', path: '#' },
    { label: 'Pricing', path: '#' },
    { label: 'New Arrivals', path: '/products' },
    { label: 'Best Sellers', path: '/products' },
  ],
  company: [
    { label: 'About Us', path: '#' },
    { label: 'Careers', path: '#' },
    { label: 'Blog', path: '#' },
    { label: 'Contact', path: '#' },
  ],
  support: [
    { label: 'Help Center', path: '#' },
    { label: 'Shipping', path: '#' },
    { label: 'Returns', path: '#' },
    { label: 'Privacy Policy', path: '#' },
  ],
};

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: '#' },
];

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // ScrollTrigger to animate footer columns when they enter the viewport
      gsap.from(elementsRef.current, {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 95%',
          toggleActions: 'play none none reverse',
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="border-t border-white/[0.06] bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div ref={(el) => { elementsRef.current[0] = el; }} className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 w-fit" data-hover>
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center transform origin-center transition-transform hover:scale-105 active:scale-95">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold text-white">
                Mart<span className="text-white/50">X</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs">
              Discover curated products from world-class brands. Premium quality,
              exceptional design, free shipping on orders over $50.
            </p>
            {/* Newsletter */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-10 px-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
              />
              <Button size="md" data-hover>Subscribe</Button>
            </div>
          </div>

          {/* Links */}
          <div ref={(el) => { elementsRef.current[1] = el; }}>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    data-hover
                    className="text-sm text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div ref={(el) => { elementsRef.current[2] = el; }}>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    data-hover
                    className="text-sm text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div ref={(el) => { elementsRef.current[3] = el; }}>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    data-hover
                    className="text-sm text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          ref={(el) => { elementsRef.current[4] = el; }}
          className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-white/30">
            © 2026 MartX. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                data-hover
                className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all duration-300 transform hover:scale-110 active:scale-95 hover:-translate-y-1 block"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
