import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/80',
        secondary:
          'border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80',
        destructive:
          'border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/80',
        outline: 'text-[hsl(var(--foreground))]',
        success:
          'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning:
          'border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        error:
          'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-1.5 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
