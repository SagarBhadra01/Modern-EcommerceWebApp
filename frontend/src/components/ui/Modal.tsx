import { type ReactNode, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Modal = ({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Manage mount state based on isOpen to allow exit animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    }
  }, [isOpen]);

  // Entrance and Exit animations
  useEffect(() => {
    if (shouldRender) {
      if (isOpen) {
        // Animate IN
        if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        if (contentRef.current) {
          gsap.fromTo(contentRef.current,
            { opacity: 0, scale: 0.95, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }
          );
        }
      } else {
        // Animate OUT
        document.body.style.overflow = 'unset';
        const tl = gsap.timeline({
          onComplete: () => setShouldRender(false)
        });
        if (contentRef.current) {
          tl.to(contentRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.2, ease: 'power3.in' }, 0);
        }
        if (overlayRef.current) {
          tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0);
        }
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, shouldRender]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  if (!shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0"
        onClick={onClose}
      />
      <div
        ref={contentRef}
        className={cn(
          'relative w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] opacity-0',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[#1A1A1A]">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 z-10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export { Modal };
export type { ModalProps };
