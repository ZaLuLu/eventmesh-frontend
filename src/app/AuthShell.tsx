import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { BRAND_CONFIG } from '@/config/brand'

export const AuthShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between p-6 sm:p-12">
      <header className="flex items-baseline justify-between border-b border-ink-15 pb-6">
        <Link to="/" className="font-display text-3xl uppercase tracking-tight text-ink hover:opacity-80">
          {BRAND_CONFIG.name}
        </Link>
        <span className="font-mono text-xs uppercase tracking-wide text-ink-60">
          Secure Access Portal
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-paper border-2 border-ink p-6 sm:p-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-ink-15 pt-6 flex flex-col sm:flex-row items-center justify-between text-ink-60 font-mono text-[11px] uppercase tracking-wide gap-2">
        <span>{BRAND_CONFIG.copyright}</span>
        <Link to="/" className="hover:text-ink underline">Return to public catalogue</Link>
      </footer>
    </div>
  )
}
