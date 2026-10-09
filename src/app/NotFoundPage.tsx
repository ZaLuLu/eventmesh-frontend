import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/design-system/primitives/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full py-16 bg-bg flex flex-col items-center justify-center p-6 text-center">
      <span className="text-caption font-semibold text-accent mb-2">
        Error 404 · Page Not Found
      </span>
      <h1 className="text-h1 font-semibold text-text mb-2">
        404
      </h1>
      <p className="text-body text-text-2 max-w-md mb-6">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/">
        <Button size="md" variant="primary">Back to Home</Button>
      </Link>
    </div>
  )
}
