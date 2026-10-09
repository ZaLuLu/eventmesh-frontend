import React from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'line' | 'pills'
  surface?: 'public' | 'admin'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  surface = 'public',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <div
        role="tablist"
        aria-label="Filter categories"
        className={cn('flex items-center gap-2 overflow-x-auto no-scrollbar py-1', className)}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 h-10 px-4 text-small font-medium rounded-full transition-all duration-150 select-none whitespace-nowrap outline-none',
                'focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2',
                isActive
                  ? 'bg-champion text-white font-semibold shadow-soft'
                  : 'bg-surface text-text-2 border border-line hover:bg-lavender-100 hover:text-champion'
              )}
            >
              {tab.icon && <span className="text-current flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-caption font-medium',
                    isActive ? 'bg-white/20 text-white' : 'bg-lavender-100 text-champion'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="tablist"
      className={cn('flex items-center gap-1 overflow-x-auto border-b border-line no-scrollbar', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const activeStyles =
          surface === 'admin'
            ? isActive
              ? 'border-b-2 border-admin-accent text-admin-accent font-semibold'
              : 'text-text-2 hover:text-text border-b-2 border-transparent'
            : isActive
            ? 'border-b-2 border-violet text-violet font-semibold'
            : 'text-text-2 hover:text-text border-b-2 border-transparent'

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-3 text-small transition-colors duration-150 whitespace-nowrap flex items-center gap-2 select-none outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2',
              activeStyles
            )}
          >
            {tab.icon && <span className="text-current">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-caption font-medium',
                  isActive
                    ? surface === 'admin'
                      ? 'bg-admin-accent text-white'
                      : 'bg-lavender-100 text-champion'
                    : 'bg-lavender-100/60 text-text-2'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
