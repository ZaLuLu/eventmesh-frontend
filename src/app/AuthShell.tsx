import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { BRAND_CONFIG } from '@/config/brand'

export const AuthShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 sm:p-12">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-line">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="h-8 w-8 rounded-btn bg-accent flex items-center justify-center text-on-accent font-semibold text-small">
            EM
          </span>
          <span className="font-semibold text-h3 text-text">
            EventMesh
          </span>
        </Link>
        <span className="text-caption font-medium text-text-2 bg-subtle px-3 py-1.5 rounded-full border border-line">
          Sign In Portal
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-panel bg-surface border border-line p-6 sm:p-8">
          <Outlet />
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full border-t border-line pt-6 flex flex-col sm:flex-row items-center justify-between text-text-3 text-caption gap-2">
        <span>{BRAND_CONFIG.copyright}</span>
        <Link to="/" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Return to Home
        </Link>
      </footer>
    </div>
  )
}
