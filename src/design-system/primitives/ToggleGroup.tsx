import React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center p-1 rounded-full bg-surface border border-line shadow-soft select-none',
      className
    )}
    {...props}
  />
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-small font-medium rounded-full transition-all duration-150',
      'text-text-2 hover:text-champion hover:bg-lavender-100/50',
      'data-[state=on]:bg-champion data-[state=on]:text-white data-[state=on]:font-semibold data-[state=on]:shadow-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-1',
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
))
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName
