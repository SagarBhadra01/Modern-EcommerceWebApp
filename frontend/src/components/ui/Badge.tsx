import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

const Badge = ({ variant = 'default', children, className }: BadgeProps) => {
  const variants = {
    default: 'bg-white/10 text-white',
    success: 'bg-success/15 text-success',
    danger: 'bg-danger/15 text-danger',
    warning: 'bg-warning/15 text-warning',
    info: 'bg-white/10 text-white/70',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
export type { BadgeProps };
