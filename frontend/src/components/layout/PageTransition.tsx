import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !overlayRef.current) return;

    // Reset scroll position on route change
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // 1. Enter animation (page content fades and slides up slightly)
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 } // Slight delay to let overlay finish
      );

      // 2. Overlay reveal animation (black screen slides up to reveal new page)
      gsap.fromTo(overlayRef.current,
        { top: 0, height: '100vh' },
        { top: 0, height: '0vh', duration: 0.8, ease: 'power4.inOut' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [location.pathname]); // Re-run animation when the path changes

  return (
    <>
      <div 
        ref={overlayRef} 
        className="fixed inset-0 bg-black z-[9998] pointer-events-none" 
        style={{ height: '100vh', top: 0 }} 
      />
      <div ref={containerRef} className="will-change-transform">
        {children}
      </div>
    </>
  );
};
