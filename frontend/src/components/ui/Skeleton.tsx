import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'thumbnail';
  className?: string;
  lines?: number;
}

const Skeleton = ({ variant = 'text', className, lines = 1 }: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-white/[0.04] rounded-xl';

  const variants = {
    text: 'h-4 w-full',
    card: 'h-64 w-full',
    avatar: 'h-10 w-10 rounded-full',
    thumbnail: 'h-16 w-16',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants.text,
              i === lines - 1 && 'w-3/4'
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className={cn(baseClasses, 'h-48 w-full')} />
        <div className={cn(baseClasses, 'h-4 w-3/4')} />
        <div className={cn(baseClasses, 'h-4 w-1/2')} />
        <div className="flex gap-2">
          <div className={cn(baseClasses, 'h-8 w-20')} />
          <div className={cn(baseClasses, 'h-8 flex-1')} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, variants[variant], className)} />
  );
};

export { Skeleton };
export type { SkeletonProps };
