import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/design-system/primitives/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full min-h-[70vh] bg-paper flex flex-col items-center justify-center p-8 text-center">
      <span className="font-mono text-xs uppercase tracking-wide text-ink-60 mb-2">
        Error 404 · Uncatalogued Entry
      </span>
      <h1 className="font-display text-6xl sm:text-8xl uppercase text-ink mb-4">
        Void Space
      </h1>
      <p className="font-body text-base text-ink-60 max-w-md mb-8">
        The requested archival link does not resolve to an active exhibition, collective dossier, or system route.
      </p>
      <Link to="/">
        <Button size="md" arrow>Return to Exhibition Ground</Button>
      </Link>
    </div>
  )
}
