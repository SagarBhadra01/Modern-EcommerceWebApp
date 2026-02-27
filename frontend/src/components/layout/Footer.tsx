import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-black">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
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
              <Button size="md">Subscribe</Button>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-white/30">
            © 2026 MartX. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all duration-300"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export { Footer };
