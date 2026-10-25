import React from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '@/api/contracts/event'
import { eventDestination } from '@/lib/eventPresentation'

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { event: Event }

export function EventLink({ event, children, ...props }: Props) {
  const href = eventDestination(event)
  if (!href) {
    return (
      <span className={props.className} aria-disabled="true">
        {children}
        <span className="sr-only"> — event link unavailable</span>
      </span>
    )
  }
  if (event.kind === 'imported' || href.startsWith('http')) {
    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <span className="sr-only"> — on {event.provider || 'external provider'}</span>
      </a>
    )
  }
  return (
    <Link {...props} to={href}>
      {children}
    </Link>
  )
}
