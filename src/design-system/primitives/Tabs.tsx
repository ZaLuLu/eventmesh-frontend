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
      className={`flex items-center gap-1 overflow-x-auto border-b border-line no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const activeStyles =
          surface === 'admin'
            ? isActive
              ? 'border-b-2 border-admin-accent text-admin-accent font-semibold'
              : 'text-text-2 hover:text-text border-b-2 border-transparent'
            : isActive
            ? 'border-b-2 border-accent text-accent font-semibold'
            : 'text-text-2 hover:text-text border-b-2 border-transparent'

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-3 text-small transition-colors duration-150 whitespace-nowrap flex items-center gap-2 select-none focus-visible:outline-2 focus-visible:outline-text ${activeStyles}`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`px-2 py-0.5 rounded-full text-caption font-medium ${
                  isActive
                    ? surface === 'admin'
                      ? 'bg-admin-accent text-white'
                      : 'bg-accent-soft text-accent'
                    : 'bg-subtle text-text-2'
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
