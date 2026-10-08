import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/design-system/primitives/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full min-h-[70vh] bg-canvas flex flex-col items-center justify-center p-8 text-center">
      <span className="text-xs font-semibold text-md-primary mb-2">
        Error 404 · Page Not Found
      </span>
      <h1 className="font-display text-5xl sm:text-7xl font-bold text-slate-900 mb-4 tracking-tight">
        404
      </h1>
      <p className="font-body text-sm text-slate-500 max-w-md mb-8">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/">
        <Button size="md" variant="primary" arrow>Back to Home</Button>
      </Link>
    </div>
  )
}
