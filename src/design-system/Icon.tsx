import React from 'react'
import type { IconWeight } from '@phosphor-icons/react'
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowsClockwise,
  Bell,
  BookmarkSimple,
  CalendarBlank,
  CalendarPlus,
  Camera,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Certificate,
  Check,
  CheckCircle,
  Circle,
  Clock,
  Compass,
  Copy,
  DotsSixVertical,
  DownloadSimple,
  Envelope,
  EnvelopeSimple,
  Eye,
  FloppyDisk,
  FolderSimpleDashed,
  Funnel,
  Gauge,
  Gear,
  GridFour,
  House,
  Link as LinkIcon,
  List,
  ListBullets,
  LockKey,
  LockSimple,
  MagnifyingGlass,
  MagnifyingGlassPlus,
  MapPin,
  Megaphone,
  Palette,
  PaperPlaneRight,
  PencilSimple,
  Phone,
  Plus,
  PlusCircle,
  QrCode,
  SealCheck,
  ShareNetwork,
  ShieldCheck,
  ShieldWarning,
  SignOut,
  Sparkle,
  SpeakerHigh,
  SpeakerSlash,
  SquaresFour,
  Target,
  Ticket,
  Trash,
  UploadSimple,
  User,
  UserCheck,
  Users,
  Warning,
  WarningCircle,
  WifiSlash,
  X,
} from '@phosphor-icons/react'

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name?: string
  size?: number | string
  weight?: IconWeight
  color?: string
  mirrored?: boolean
  className?: string
}

const iconRegistry: Record<string, React.ComponentType<any>> = {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowsClockwise,
  Bell,
  BookmarkSimple,
  CalendarBlank,
  CalendarPlus,
  Camera,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Certificate,
  Check,
  CheckCircle,
  Circle,
  Clock,
  Compass,
  Copy,
  DotsSixVertical,
  DownloadSimple,
  Envelope,
  EnvelopeSimple,
  Eye,
  FloppyDisk,
  FolderSimpleDashed,
  Funnel,
  Gauge,
  Gear,
  GridFour,
  House,
  Link: LinkIcon,
  List,
  ListBullets,
  LockKey,
  LockSimple,
  MagnifyingGlass,
  MagnifyingGlassPlus,
  MapPin,
  Megaphone,
  Palette,
  PaperPlaneRight,
  PencilSimple,
  Phone,
  Plus,
  PlusCircle,
  QrCode,
  SealCheck,
  ShareNetwork,
  ShieldCheck,
  ShieldWarning,
  SignOut,
  Sparkle,
  SpeakerHigh,
  SpeakerSlash,
  SquaresFour,
  Target,
  Ticket,
  Trash,
  UploadSimple,
  User,
  UserCheck,
  Users,
  Warning,
  WarningCircle,
  WifiSlash,
  X,
}

/**
 * Standard Icon Sizes Scale (Denim Dept & Hallmark Standard)
 */
export const ICON_SIZES = {
  xs: 14, // 0.875rem - Inline metadata & micro-tags
  sm: 20, // 1.25rem  - Buttons, chips, search docks
  md: 22, // 1.375rem - Navbar utilities & drawer controls
  lg: 24, // 1.5rem   - Empty states & modal headers
} as const

/**
 * Single Unified Icon Wrapper for EventMesh.
 * Adheres to Denim Dept 1.5px geometric stroke line standard with strict accessible ARIA attributes.
 */
export const Icon: React.FC<IconProps> = ({
  name = 'Sparkle',
  size = ICON_SIZES.sm,
  weight = 'regular',
  color = 'currentColor',
  className = '',
  'aria-label': ariaLabel,
  ...rest
}) => {
  const resolvedName = name.charAt(0).toUpperCase() + name.slice(1)
  const PhosphorComponent = iconRegistry[resolvedName] || Sparkle

  return (
    <PhosphorComponent
      size={size}
      weight={weight}
      color={color}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      {...rest}
    />
  )
}

// Re-export explicit icons used across the project
export {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowsClockwise,
  Bell,
  BookmarkSimple,
  CalendarBlank,
  CalendarPlus,
  Camera,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Certificate,
  Check,
  CheckCircle,
  Circle,
  Clock,
  Compass,
  Copy,
  DotsSixVertical,
  DownloadSimple,
  Envelope,
  EnvelopeSimple,
  Eye,
  FloppyDisk,
  FolderSimpleDashed,
  Funnel,
  Gauge,
  Gear,
  GridFour,
  House,
  LinkIcon as Link,
  List,
  ListBullets,
  LockKey,
  LockSimple,
  MagnifyingGlass,
  MagnifyingGlassPlus,
  MapPin,
  Megaphone,
  Palette,
  PaperPlaneRight,
  PencilSimple,
  Phone,
  Plus,
  PlusCircle,
  QrCode,
  SealCheck,
  ShareNetwork,
  ShieldCheck,
  ShieldWarning,
  SignOut,
  Sparkle,
  SpeakerHigh,
  SpeakerSlash,
  SquaresFour,
  Target,
  Ticket,
  Trash,
  UploadSimple,
  User,
  UserCheck,
  Users,
  Warning,
  WarningCircle,
  WifiSlash,
  X,
}

