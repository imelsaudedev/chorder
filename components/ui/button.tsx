import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-primary hover:text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-primary',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        square: 'p-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
      rounded: {
        default: 'rounded-md',
        lg: 'rounded-2xl',
        left: 'rounded-l-md',
        right: 'rounded-r-md',
        none: 'rounded-none',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  circle?: boolean; // Opção 2: Nova propriedade para botões circulares
}

const Button = (
  {
    ref,
    className,
    variant,
    size,
    rounded,
    asChild = false,
    circle = false,
    ...props
  }: ButtonProps & {
    ref: React.RefObject<HTMLButtonElement>;
  }
) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, rounded, className }), circle && 'rounded-full aspect-square')}
      ref={ref}
      {...props}
    />
  );
};
Button.displayName = 'Button';

export { Button, buttonVariants };
