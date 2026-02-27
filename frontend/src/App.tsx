import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/router';
import gsap from 'gsap';

// ─── Pure GSAP Custom Cursor (Global) ───────────────────────────────
const GlobalCursor = () => {
  useEffect(() => {
    // We only want custom cursor on desktop devices (non-touch)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = document.querySelector('.gsap-global-cursor');
    const dot = document.querySelector('.gsap-global-cursor-dot');
    if (!cursor || !dot) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(dot, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3' });
    const dotXTo = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' });
    const dotYTo = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });

    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      dotXTo(e.clientX);
      dotYTo(e.clientY);
    };

    window.addEventListener('mousemove', move, { passive: true });

    // Handle interactive hovers dynamically since elements mount/unmount often
    const onEnter = () => gsap.to(cursor, { scale: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'transparent', duration: 0.3 });
    const onLeave = () => gsap.to(cursor, { scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.6)', duration: 0.3 });

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-hover]')) onEnter();
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-hover]')) onLeave();
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      <div className="gsap-global-cursor fixed top-0 left-0 w-8 h-8 rounded-full border border-white/60 pointer-events-none z-[9999] hidden lg:block mix-blend-difference" />
      <div className="gsap-global-cursor-dot fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white pointer-events-none z-[9999] hidden lg:block" />
    </>
  );
};

function App() {
  return (
    <>
      <GlobalCursor />
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0A0A0A',
            border: '1px solid #1A1A1A',
            color: '#FFFFFF',
          },
        }}
      />
    </>
  );
}

export default App;
