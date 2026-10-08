import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { BRAND_CONFIG } from '@/config/brand'

export const AuthShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-800 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200/60 z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-neo-sm group-hover:scale-105 transition-transform">
            EM
          </span>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Event<span className="text-gradient-feral">Mesh</span>
          </span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-[#EEF2F6] shadow-neo-sm px-3 py-1.5 rounded-full border border-white/60">
          Sign In Portal
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-md rounded-3xl bg-[#EEF2F6] border border-white/80 p-6 sm:p-8 shadow-neo-card">
          <Outlet />
        </div>
      </main>

      <footer className="max-w-5xl mx-auto w-full border-t border-slate-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-2 z-10">
        <span>{BRAND_CONFIG.copyright}</span>
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
          Return to Home
        </Link>
      </footer>
    </div>
  )
}
