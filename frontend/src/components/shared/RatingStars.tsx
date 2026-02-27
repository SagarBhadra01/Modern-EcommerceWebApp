import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const RatingStars = ({
  rating,
  maxRating = 5,
  size = 'sm',
  showValue = false,
  className,
}: RatingStarsProps) => {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;

        return (
          <Star
            key={i}
            className={cn(
              sizes[size],
              filled
                ? 'fill-yellow-400 text-yellow-400'
                : half
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-transparent text-white/10'
            )}
          />
        );
      })}
      {showValue && (
        <span className="text-sm font-medium text-white/50 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export { RatingStars };
export type { RatingStarsProps };
