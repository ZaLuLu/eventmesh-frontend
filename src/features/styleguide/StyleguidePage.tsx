import React, { useState } from 'react'
import { Button } from '@/design-system/primitives/Button'
import { Chip } from '@/design-system/primitives/Chip'
import { Band } from '@/design-system/primitives/Band'
import { MetaRow } from '@/design-system/primitives/MetaRow'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
import { Sheet } from '@/design-system/primitives/Sheet'
import { Modal } from '@/design-system/primitives/Modal'
import { Table } from '@/design-system/primitives/Table'
import { TOKENS } from '@/design-system/tokens'
import { getContrastSummary } from '@/lib/contrast'

export const StyleguidePage: React.FC = () => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [testHex, setTestHex] = useState('#2F4BD6')

  const contrastInfo = getContrastSummary(testHex)

  const sampleTableData = [
    { id: '1', name: 'The Grand Turing Hackathon', club: 'CP Club', seats: 250, status: 'published' },
    { id: '2', name: 'Neural Frontiers Symposium', club: 'AIONAI', seats: 180, status: 'published' },
    { id: '3', name: 'Zero-Day Protocol CTF', club: 'CyberGuard', seats: 200, status: 'completed' },
  ]

  return (
    <div className="w-full bg-paper text-ink min-h-screen py-12 sm:py-20">
      <div className="px-[4vw] max-w-6xl mx-auto space-y-16">
        {/* Title */}
        <div className="border-b border-ink-15 pb-6">
          <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
            Design Tokens & Primitives Specification
          </span>
          <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
            Design System Styleguide
          </h1>
          <p className="font-body text-base text-ink-60 mt-2">
            Comprehensive catalog of universal tokens, contrast calculator, typography scale, buttons in all states, identity bands, sheets, and tables.
          </p>
        </div>

        {/* 1. UNIVERSAL TOKENS */}
        <section className="space-y-6">
          <h2 className="font-display text-3xl uppercase text-ink border-b border-ink-15 pb-2">
            1. Universal Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="border border-ink p-4 space-y-2 bg-[#F3EEE9]">
              <div className="h-12 border border-ink bg-[#F3EEE9]" />
              <p className="font-mono text-xs font-bold">--paper</p>
              <p className="font-mono text-[10px] text-ink-60">#F3EEE9</p>
            </div>
            <div className="border border-ink p-4 space-y-2 bg-paper">
              <div className="h-12 bg-[#11100F]" />
              <p className="font-mono text-xs font-bold">--ink</p>
              <p className="font-mono text-[10px] text-ink-60">#11100F</p>
            </div>
            <div className="border border-ink p-4 space-y-2 bg-paper">
              <div className="h-12 bg-[#E9E2DA]" />
              <p className="font-mono text-xs font-bold">--paper-deep</p>
              <p className="font-mono text-[10px] text-ink-60">#E9E2DA</p>
            </div>
            <div className="border border-ink p-4 space-y-2 bg-paper">
              <div className="h-12 bg-[#A88752]" />
              <p className="font-mono text-xs font-bold">--premium</p>
              <p className="font-mono text-[10px] text-ink-60">#A88752</p>
            </div>
            <div className="border border-ink p-4 space-y-2 bg-paper">
              <div className="h-12 bg-[#0F1A24]" />
              <p className="font-mono text-xs font-bold">--admin-sidebar</p>
              <p className="font-mono text-[10px] text-ink-60">#0F1A24</p>
            </div>
            <div className="border border-ink p-4 space-y-2 bg-paper">
              <div className="h-12 bg-[#1F5F5B]" />
              <p className="font-mono text-xs font-bold">--admin-accent</p>
              <p className="font-mono text-[10px] text-ink-60">#1F5F5B</p>
            </div>
          </div>
        </section>

        {/* 2. AUTOMATIC WCAG CONTRAST CALCULATOR */}
        <section className="space-y-6">
          <h2 className="font-display text-3xl uppercase text-ink border-b border-ink-15 pb-2">
            2. Mathematical WCAG Contrast Engine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="border-2 border-ink p-6 space-y-4">
              <Field
                label="Test Color Hex"
                value={testHex}
                onChange={(e) => setTestHex(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-2">
                {TOKENS.curatedPalettes.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setTestHex(p.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1 border border-ink font-mono text-[11px] uppercase hover:bg-paper-deep"
                  >
                    <span className="h-2.5 w-2.5 inline-block" style={{ backgroundColor: p.hex }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="p-8 border-2 border-ink flex flex-col justify-between min-h-[220px]"
              style={{
                backgroundColor: contrastInfo.eventColor,
                color: contrastInfo.onEventColor,
              }}
            >
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widecaps block mb-1 opacity-80">
                  Calculated Output
                </span>
                <p className="font-display text-4xl uppercase">
                  Computed --on-event: {contrastInfo.onEventColor}
                </p>
              </div>

              <div className="pt-6 border-t border-current/20 font-mono text-xs uppercase flex justify-between">
                <span>Contrast Ratio: {contrastInfo.contrastRatio}:1</span>
                <span>
                  WCAG AA: {contrastInfo.isAANormal ? 'PASS (≥ 4.5:1)' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BUTTONS IN ALL STATES */}
        <section className="space-y-6">
          <h2 className="font-display text-3xl uppercase text-ink border-b border-ink-15 pb-2">
            3. Buttons in All States (Flat and Proper)
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase text-ink-60">Primary Variant</p>
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="lg" arrow>Primary Large (56px)</Button>
                <Button size="md">Primary Medium (48px)</Button>
                <Button size="sm">Primary Small (40px)</Button>
                <Button size="dense">Dense (36px)</Button>
                <Button disabled>Disabled (40% Opacity)</Button>
                <Button loading>Loading State</Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-xs uppercase text-ink-60">Secondary & Ghost Variants</p>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="secondary" size="md">Secondary Border</Button>
                <Button variant="ghost" size="md">Ghost Underlined</Button>
                <Button variant="danger" size="md">Danger Action</Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-xs uppercase text-ink-60">Admin Surface Buttons</p>
              <div className="flex flex-wrap gap-4 items-center p-4 bg-[#E6EAEC] border border-[#C9D0D4]">
                <Button surface="admin" variant="primary" size="md">Admin Primary</Button>
                <Button surface="admin" variant="secondary" size="md">Admin Secondary</Button>
                <Button surface="admin" size="dense">Admin Dense</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CHIPS, BANDS & META-ROWS */}
        <section className="space-y-6">
          <h2 className="font-display text-3xl uppercase text-ink border-b border-ink-15 pb-2">
            4. Bands, MetaRows & Chips
          </h2>
          <div className="space-y-6">
            <Band
              color="#2F4BD6"
              chipLabel="FEATURED IDENTIFIER"
              tagline="Sample full-bleed identity band demonstration"
              metaRight="OCT 2026"
            />

            <div className="max-w-md border border-ink p-6 bg-paper">
              <MetaRow label="Format" value="In-Person Hackathon" />
              <MetaRow label="Duration" value="48 Continuous Hours" />
              <MetaRow label="Capacity" value="250 Attendees" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip label="All" active />
              <Chip label="Workshops" />
              <Chip label="Hackathons" color="#2F4BD6" />
              <Chip label="Removable Chip" active onRemove={() => {}} />
            </div>
          </div>
        </section>

        {/* 5. DIALOGS & TABLES */}
        <section className="space-y-6">
          <h2 className="font-display text-3xl uppercase text-ink border-b border-ink-15 pb-2">
            5. Flat Paper Sheets & Tables
          </h2>

          <div className="flex gap-4">
            <Button onClick={() => setSheetOpen(true)}>Open Bottom Sheet</Button>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Open Modal Dialog</Button>
          </div>

          <Table
            columns={[
              { key: 'name', header: 'Event Title' },
              { key: 'club', header: 'Organizing Club' },
              { key: 'seats', header: 'Capacity' },
              { key: 'status', header: 'Status' },
            ]}
            data={sampleTableData}
            keyExtractor={(item) => item.id}
          />
        </section>

        {/* Demo Sheet */}
        <Sheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Curatorial Sheet Surface"
          subtitle="Interactive Specimen"
        >
          <div className="space-y-4">
            <p className="font-body text-base text-ink">
              Flat paper surface with no background blur. Closes with ESC key or backdrop tap.
            </p>
            <Button fullWidth onClick={() => setSheetOpen(false)}>Dismiss Sheet</Button>
          </div>
        </Sheet>

        {/* Demo Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal Confirmation Window"
          subtitle="Verification"
        >
          <div className="space-y-4">
            <p className="font-body text-base text-ink">
              Structured dialog window for critical decisions and confirmation prompts.
            </p>
            <Button fullWidth onClick={() => setModalOpen(false)}>Close Window</Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
