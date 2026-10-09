import React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-panel bg-surface text-text',
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

export interface CommandDialogProps extends Dialog.DialogProps {
  children: React.ReactNode
}

export const CommandDialog: React.FC<CommandDialogProps> = ({ children, ...props }) => {
  return (
    <Dialog.Root {...props}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-champion/40 transition-opacity" />
        <Dialog.Content className="fixed left-[50%] top-[20%] z-50 w-full max-w-xl translate-x-[-50%] p-0 outline-none">
          <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-card">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-line px-4" cmdk-input-wrapper="">
    <Search className="mr-3 h-5 w-5 shrink-0 text-text-3" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-14 w-full rounded-md bg-transparent py-3 text-small outline-none placeholder:text-text-3 disabled:cursor-not-allowed disabled:opacity-50 text-text',
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[360px] overflow-y-auto overflow-x-hidden p-2', className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-8 text-center text-small text-text-2"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-caption font-semibold text-text-3 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-text-3',
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-small outline-none aria-selected:bg-lavender-100 aria-selected:text-champion data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors duration-100',
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName
