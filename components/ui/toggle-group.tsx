'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { toggleVariants } from '@/components/ui/toggle';

// Cria o contexto para as variantes
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

const ToggleGroup = (
  {
    ref,
    className,
    variant = 'outline',
    size = 'default',
    children,
    ...props
  }
) => (<ToggleGroupPrimitive.Root ref={ref} className={cn('flex items-center justify-center gap-1', className)} {...props}>
  {/* Fornece as variantes ao contexto */}
  <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
</ToggleGroupPrimitive.Root>);

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = (
  {
    ref,
    className,
    children,
    variant: localVariant,
    size: localSize,
    ...props
  }
) => {
  // Obtém as variantes do contexto
  const context = React.useContext(ToggleGroupContext);

  // Define as variantes: prioriza as props locais, mas usa o contexto se as props locais não forem fornecidas
  const variant = localVariant || context.variant;
  const size = localSize || context.size;

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({ variant, size }), // Aplica as variantes
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
};

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
