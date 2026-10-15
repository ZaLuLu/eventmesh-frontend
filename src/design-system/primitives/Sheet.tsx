import React from 'react'
import { Modal } from './Modal'

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  surface?: 'public' | 'admin'
}

export const Sheet: React.FC<SheetProps> = (props) => (
  <Modal {...props} placement="bottom" maxWidth="max-w-2xl" />
)
