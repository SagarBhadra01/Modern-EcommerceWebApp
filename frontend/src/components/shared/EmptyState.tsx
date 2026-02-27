import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  className,
}: EmptyStateProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center will-change-transform',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-white/20">{icon}</div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/40 max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && actionLink && (
        <Link to={actionLink}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export { EmptyState };
export type { EmptyStateProps };
