import React, { useState } from 'react'
import { Button } from '@/design-system/primitives/Button'
import { Chip } from '@/design-system/primitives/Chip'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
import { Sheet } from '@/design-system/primitives/Sheet'
import { Modal } from '@/design-system/primitives/Modal'
import { Table } from '@/design-system/primitives/Table'
import { Skeleton } from '@/design-system/primitives/Skeleton'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { ErrorState } from '@/design-system/primitives/ErrorState'
import { Tabs } from '@/design-system/primitives/Tabs'
import { GradientBackdrop } from '@/design-system/GradientBackdrop'
import { useToast } from '@/design-system/primitives/Toast'
import { TOKENS } from '@/design-system/tokens'
import { getContrastSummary } from '@/lib/contrast'
import { ArrowRight, Calendar, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react'

export const StyleguidePage: React.FC = () => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedChip, setSelectedChip] = useState('all')
  const [activeTab, setActiveTab] = useState('about')
  const [testHex, setTestHex] = useState('#C93E27')
  const { toast } = useToast()

  const contrastInfo = getContrastSummary(testHex)

  const sampleTableData = [
    { id: '1', title: 'The Grand Turing Hackathon', club: 'DevCraft', seats: '250 / 250', status: 'published' },
    { id: '2', title: 'Neural Frontiers Symposium', club: 'AIONAI', seats: '180 / 200', status: 'published' },
    { id: '3', title: 'Zero-Day Protocol CTF', club: 'CyberGuard', seats: '140 / 150', status: 'completed' },
  ]

  const tableColumns = [
    { key: 'title', header: 'Event Title' },
    { key: 'club', header: 'Collective' },
    { key: 'seats', header: 'Seats' },
    { key: 'status', header: 'Status' },
  ]

  return (
    <div className="w-full bg-bg text-text min-h-screen py-10 sm:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-line pb-6">
          <span className="text-caption font-semibold text-accent block mb-1">
            Design Tokens & Primitives Specification
          </span>
          <h1 className="text-h1 font-semibold text-text">
            Calm Coral Styleguide
          </h1>
          <p className="text-body text-text-2 mt-1 max-w-2xl">
            Clean, minimal, flat design system. Solid surfaces, 1px hairlines, zero blur or glassmorphism, no typography below 13px, and accessible WCAG AA contrast.
          </p>
        </div>

        {/* 1. HERO WITH GRADIENT BACKDROP */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            1. Hero Billboard with Coral Dawn Backdrop
          </h2>
          <div className="relative rounded-panel overflow-hidden border border-line bg-surface max-h-[440px] p-6 sm:p-10 flex flex-col justify-center">
            <GradientBackdrop />
            <div className="relative z-10 max-w-xl bg-surface/95 border border-line rounded-panel p-6">
              <span className="text-caption font-semibold text-accent block mb-1">
                Featured Exhibition Showcase
              </span>
              <h3 className="text-h2 font-semibold text-text">
                The Grand Turing Hackathon 2026
              </h3>
              <p className="text-small text-text-2 mt-2 leading-relaxed">
                48-hour competitive software architecture sprint with distributed compute clusters.
              </p>
              <div className="pt-4 flex items-center gap-3">
                <Button size="hero" variant="primary">
                  Register for Pass
                </Button>
                <Button size="hero" variant="secondary">
                  Explore Tracks
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. COLOR TOKENS */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            2. Color Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="border border-line rounded-panel p-3 bg-surface space-y-2">
              <div className="h-10 rounded-btn bg-bg border border-line" />
              <p className="text-caption font-semibold text-text">--bg</p>
              <p className="text-caption text-text-3 font-mono">#FBFAF8</p>
            </div>
            <div className="border border-line rounded-panel p-3 bg-surface space-y-2">
              <div className="h-10 rounded-btn bg-surface border border-line" />
              <p className="text-caption font-semibold text-text">--surface</p>
              <p className="text-caption text-text-3 font-mono">#FFFFFF</p>
            </div>
            <div className="border border-line rounded-panel p-3 bg-surface space-y-2">
              <div className="h-10 rounded-btn bg-subtle border border-line" />
              <p className="text-caption font-semibold text-text">--subtle</p>
              <p className="text-caption text-text-3 font-mono">#F3F1ED</p>
            </div>
            <div className="border border-line rounded-panel p-3 bg-surface space-y-2">
              <div className="h-10 rounded-btn bg-line" />
              <p className="text-caption font-semibold text-text">--line</p>
              <p className="text-caption text-text-3 font-mono">#E7E4DE</p>
            </div>
            <div className="border border-line rounded-panel p-3 bg-surface space-y-2">
              <div className="h-10 rounded-btn bg-accent" />
              <p className="text-caption font-semibold text-text">--accent</p>
              <p className="text-caption text-text-3 font-mono">#C93E27</p>
            </div>
            <div className="border border-line rounded-panel p-3 bg-surface space-y-2">
              <div className="h-10 rounded-btn bg-accent-soft border border-line" />
              <p className="text-caption font-semibold text-text">--accent-soft</p>
              <p className="text-caption text-text-3 font-mono">#FDEBE6</p>
            </div>
            <div className="border border-line rounded-panel p-3 bg-surface space-y-2">
              <div className="h-10 rounded-btn bg-text" />
              <p className="text-caption font-semibold text-text">--text</p>
              <p className="text-caption text-text-3 font-mono">#1B1A19</p>
            </div>
          </div>
        </section>

        {/* 3. TYPOGRAPHY SCALE */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            3. Typography Scale (Strictly &ge; 13px)
          </h2>
          <div className="p-6 bg-surface border border-line rounded-panel space-y-4">
            <div>
              <span className="text-caption text-text-3">h1 · clamp(2rem, 4.5vw, 3rem) weight 600</span>
              <p className="text-h1 font-semibold text-text">Architectural Engineering Federation</p>
            </div>
            <div>
              <span className="text-caption text-text-3">h2 · clamp(1.375rem, 2.5vw, 1.75rem) weight 600</span>
              <p className="text-h2 font-semibold text-text">Autonomous Student Collectives & Research Labs</p>
            </div>
            <div>
              <span className="text-caption text-text-3">h3 · 1.125rem weight 600</span>
              <p className="text-h3 font-semibold text-text">Section Heading with Balanced Density</p>
            </div>
            <div>
              <span className="text-caption text-text-3">body · 1rem (16px) leading 1.55</span>
              <p className="text-body text-text max-w-[65ch]">
                Standard editorial paragraph text with comfortable measure and readable line-height, designed to convey critical information cleanly.
              </p>
            </div>
            <div>
              <span className="text-caption text-text-3">small · 0.875rem (14px)</span>
              <p className="text-small text-text-2">Metadata lines, table cells, form labels, and compact list descriptions.</p>
            </div>
            <div>
              <span className="text-caption text-text-3">caption · 0.8125rem (13px) — Minimum Allowed Size</span>
              <p className="text-caption text-text-3">Timestamps, category labels, uppercase breadcrumbs, and helper text.</p>
            </div>
          </div>
        </section>

        {/* 4. BUTTONS & STATES */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            4. Buttons & Variants (Heights: 56 hero, 48 default, 40 compact, 36 admin)
          </h2>
          <div className="p-6 bg-surface border border-line rounded-panel space-y-6">
            <div className="space-y-2">
              <span className="text-caption font-semibold text-text-2 block">Variants</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Accent</Button>
                <Button variant="secondary">Secondary Subtle</Button>
                <Button variant="tertiary">Tertiary Link</Button>
                <Button surface="admin" variant="primary">Admin Scope</Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-caption font-semibold text-text-2 block">Sizes</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="hero">Hero (56px)</Button>
                <Button size="md">Default (48px)</Button>
                <Button size="sm">Compact (40px)</Button>
                <Button size="dense">Admin (36px)</Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-caption font-semibold text-text-2 block">States</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" loading>Loading State</Button>
                <Button variant="primary" disabled>Disabled State</Button>
                <Button variant="secondary" arrow>With Arrow</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CHIPS & FILTERS */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            5. Chips & Filters (Min 40px Desktop / 44px Mobile)
          </h2>
          <div className="p-6 bg-surface border border-line rounded-panel">
            <div className="flex flex-wrap gap-2">
              {['all', 'hackathon', 'workshop', 'symposium', 'competition'].map((c) => (
                <Chip
                  key={c}
                  selected={selectedChip === c}
                  onClick={() => setSelectedChip(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Chip>
              ))}
            </div>
          </div>
        </section>

        {/* 6. INPUTS & FIELDS */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            6. Inputs, Selects & Validation
          </h2>
          <div className="p-6 bg-surface border border-line rounded-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field
              label="Standard Text Input"
              placeholder="Full legal name"
              helpText="Enter your official name as shown on credentials."
            />
            <Field
              label="Input with Error"
              value="invalid-email"
              error="Please enter a valid academic email address."
            />
            <Select
              label="Format Category"
              options={[
                { value: 'hackathon', label: 'Competitive Hackathon' },
                { value: 'workshop', label: 'Technical Workshop' },
                { value: 'talk', label: 'Keynote Address' },
              ]}
            />
          </div>
        </section>

        {/* 7. TABS, TABLES & SKELETONS */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            7. Navigation Tabs & Dense Tables
          </h2>
          <div className="p-6 bg-surface border border-line rounded-panel space-y-6">
            <Tabs
              tabs={[
                { id: 'about', label: 'About' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'speakers', label: 'Speakers' },
                { id: 'rules', label: 'Rules' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <Table
              columns={tableColumns}
              data={sampleTableData}
            />

            <div className="space-y-2">
              <span className="text-caption font-semibold text-text-2 block">Skeletons (Gentle Opacity Pulse, No Shimmer)</span>
              <div className="space-y-2 max-w-md">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </section>

        {/* 8. MODALS, SHEETS & TOASTS */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            8. Floating Layers (Modals, Sheets, Toasts)
          </h2>
          <div className="p-6 bg-surface border border-line rounded-panel flex flex-wrap gap-4">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open Centered Modal
            </Button>
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>
              Open Bottom Sheet
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                toast({
                  title: 'Notification Dispatched',
                  message: 'Registration pass successfully saved.',
                  type: 'success',
                })
              }
            >
              Trigger Floating Toast
            </Button>
          </div>
        </section>

        {/* 9. WCAG CONTRAST ENGINE */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            9. Mathematical WCAG Contrast Engine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="border border-line rounded-panel p-6 bg-surface space-y-4">
              <Field
                label="Test Color Hex"
                value={testHex}
                onChange={(e) => setTestHex(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TOKENS.curatedPalettes.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setTestHex(p.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1 border border-line rounded-btn text-caption hover:bg-subtle transition-colors"
                  >
                    <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: p.hex }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-line rounded-panel p-6 bg-surface space-y-4">
              <span className="text-caption font-semibold text-text-3 block">
                Contrast Calculation Result
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1.5 rounded-btn font-semibold text-small"
                  style={{
                    backgroundColor: contrastInfo.eventColor,
                    color: contrastInfo.onEventColor,
                  }}
                >
                  Sample Tag
                </span>
                <span className="text-small text-text-2">
                  Computed text: {contrastInfo.onEventColor}
                </span>
              </div>
              <div className="pt-2 border-t border-line text-small flex items-center justify-between">
                <span>Contrast Ratio: {contrastInfo.contrastRatio}:1</span>
                {contrastInfo.isAANormal ? (
                  <span className="text-success flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> WCAG AA Pass
                  </span>
                ) : (
                  <span className="text-danger flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-4 w-4" /> Fail (&lt; 4.5:1)
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 10. COMPACT EMPTY & ERROR STATES */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-text border-b border-line pb-2">
            10. Compact Empty & Error States (Max 240px Tall)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-line rounded-panel bg-surface p-4">
              <EmptyState
                title="No Events Found"
                description="Try refining your search terms or filters."
              />
            </div>
            <div className="border border-line rounded-panel bg-surface p-4">
              <ErrorState
                title="Failed to Load Data"
                message="Unable to communicate with the registry."
                onRetry={() => {}}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Modal Sample */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Floating Modal"
        subtitle="Solid surface with light shadow"
      >
        <div className="space-y-4">
          <p className="text-small text-text-2 leading-relaxed">
            This modal illustrates the solid white surface, 1px hairlines, and subtle floating shadow (0 4px 16px rgba(27,26,25,0.08)).
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interactive Sheet Sample */}
      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Sample Bottom Sheet"
        subtitle="16px top radius on mobile"
      >
        <div className="space-y-4">
          <p className="text-small text-text-2 leading-relaxed">
            Mobile-friendly filter sheet sliding up cleanly without blur or backdrop glassmorphism.
          </p>
          <Button variant="primary" fullWidth onClick={() => setSheetOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
