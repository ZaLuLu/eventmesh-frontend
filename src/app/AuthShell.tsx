import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { GradientWavesBackground } from '@/design-system/visuals/GradientWavesBackground'
import { ThemeToggle } from '@/design-system/ThemeToggle'

export const AuthShell: React.FC = () => {
  return (
    <GradientWavesBackground>
      {/* High-Contrast Crisp Top Bar */}
      <header className="max-w-4xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="h-8 w-8 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform">
            EM
          </span>
          <span className="font-bold text-base text-slate-950 dark:text-white tracking-tight">
            EventMesh
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-800/90 border border-slate-300 dark:border-zinc-700 shadow-xs hover:border-slate-400"
          >
            <ArrowLeft size={13} weight="bold" />
            <span>Back to events</span>
          </Link>
        </div>
      </header>

      {/* Centered High-Contrast Solid Editorial Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] rounded-[22px] bg-white dark:bg-[#121218] border border-slate-300/80 dark:border-zinc-800 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.04)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] p-7 sm:p-9 transition-all">
          <Outlet />
        </div>
      </main>

      {/* Clear High-Visibility Editorial Footer */}
      <footer className="w-full px-4 py-6 text-center text-xs font-medium text-slate-600 dark:text-zinc-400">
        <span>© 2026 EventMesh · Central Technological University</span>
      </footer>
    </GradientWavesBackground>
  )
}
