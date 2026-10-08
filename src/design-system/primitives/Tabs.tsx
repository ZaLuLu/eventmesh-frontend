import React from 'react'

export interface TabItem {
  id: string
  label: string
  count?: number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  surface?: 'public' | 'admin'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  surface = 'public',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 overflow-x-auto border-b ${
        surface === 'admin' ? 'border-admin-border' : 'border-ink-15'
      } no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const activeStyles =
          surface === 'admin'
            ? isActive
              ? 'border-b-2 border-admin-accent text-admin-accent font-semibold'
              : 'text-ink-60 hover:text-ink border-b-2 border-transparent'
            : isActive
            ? 'border-b-2 border-ink text-ink font-semibold'
            : 'text-ink-60 hover:text-ink border-b-2 border-transparent'

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-3 font-mono text-[11px] uppercase tracking-widecaps transition-colors duration-150 whitespace-nowrap flex items-center gap-2 ${activeStyles}`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`px-1.5 py-0.5 text-[10px] ${
                  isActive ? 'bg-ink text-paper' : 'bg-ink-15 text-ink'
                }`}
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
