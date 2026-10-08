import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({
  rating = 5,
  max = 5,
  size = 'sm',
  count,
  className,
}: {
  rating?: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  count?: number;
  className?: string;
}) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center text-amber-400">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-zinc-200 dark:text-zinc-700'
            )}
          />
        ))}
      </div>
      {rating > 0 && (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          ({count})
        </span>
      )}
    </div>
  );
}
