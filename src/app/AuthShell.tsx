import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { BRAND_CONFIG } from '@/config/brand'

export const AuthShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas text-md-on-surface flex flex-col justify-between p-6 sm:p-12">
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#DADCE0]">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-md-primary flex items-center justify-center text-white font-bold text-sm shadow-xs">
            EM
          </span>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Event<span className="text-md-primary">Mesh</span>
          </span>
        </Link>
        <span className="text-xs font-semibold text-slate-500">
          Sign In Portal
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-3xl bg-white border border-[#DADCE0] p-6 sm:p-8 shadow-card-hover">
          <Outlet />
        </div>
      </main>

      <footer className="max-w-5xl mx-auto w-full border-t border-[#DADCE0] pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-2">
        <span>{BRAND_CONFIG.copyright}</span>
        <Link to="/" className="text-md-primary hover:underline font-medium">Return to Home</Link>
      </footer>
    </div>
  )
}
