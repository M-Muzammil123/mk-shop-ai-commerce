import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' | 'ai' | 'best';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
    secondary: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    outline: 'border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300',
    success:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
    ai: 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
    best: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-sm',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
