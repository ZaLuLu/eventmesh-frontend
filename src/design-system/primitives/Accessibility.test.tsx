import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Modal } from './Modal'
import { Field } from './Field'
import { Select } from './Select'

function DialogExample() {
  const [open, setOpen] = useState(false)
  return <><button onClick={() => setOpen(true)}>Edit attendee</button>
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit attendee" subtitle="Update contact details">
      <Field label="Name" /><button>Save changes</button>
    </Modal></>
}

describe('accessible compatibility primitives', () => {
  it('names dialogs, contains keyboard focus and returns it to the external trigger', async () => {
    const user = userEvent.setup()
    render(<DialogExample />)
    const trigger = screen.getByRole('button', { name: 'Edit attendee' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Edit attendee' })
    expect(dialog).toHaveAccessibleDescription('Update contact details')
    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
  it('gives repeated fields unique names and associates error/help text', () => {
    render(<><Field label="Name" error="Name is required" /><Field label="Name" helpText="As shown on your ticket" />
      <Select label="Status" error="Choose a status" options={[{ value: '', label: 'Select' }]} /></>)
    const fields = screen.getAllByRole('textbox', { name: 'Name' })
    expect(fields[0].id).not.toBe(fields[1].id)
    expect(fields[0]).toHaveAttribute('aria-invalid', 'true')
    expect(fields[0]).toHaveAccessibleDescription('Name is required')
    expect(fields[1]).toHaveAccessibleDescription('As shown on your ticket')
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveAccessibleDescription('Choose a status')
  })
})
