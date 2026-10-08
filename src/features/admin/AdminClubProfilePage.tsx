import React, { useState, useEffect } from 'react'
import { Palette, CheckCircle2, AlertTriangle, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useClub, useUpdateClub } from '@/hooks/useClubs'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { getContrastSummary } from '@/lib/contrast'
import { TOKENS } from '@/design-system/tokens'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminClubProfilePage: React.FC = () => {
  const { session } = useAuth()
  const { clubId } = usePermission()
  const { toast } = useToast()

  const targetClubId = clubId || 'club-cp'
  const { data: club, isLoading } = useClub(targetClubId)
  const updateMutation = useUpdateClub()

  const [color, setColor] = useState('#2F4BD6')
  const [about, setAbout] = useState('')
  const [whatWeDo, setWhatWeDo] = useState('')
  const [achievements, setAchievements] = useState<string[]>([])
  const [newAchievement, setNewAchievement] = useState('')

  useEffect(() => {
    if (club) {
      setColor(club.color)
      setAbout(club.about)
      setWhatWeDo(club.whatWeDo)
      setAchievements(club.achievements || [])
    }
  }, [club])

  const contrast = getContrastSummary(color)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({
        id: targetClubId,
        updates: {
          color,
          about,
          whatWeDo,
          achievements,
        },
      })
      toast({
        title: 'Club Profile Updated',
        message: 'Signature identity color and narrative preserved.',
        type: 'success',
      })
    } catch {
      toast({ title: 'Update failed', type: 'error' })
    }
  }

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()])
      setNewAchievement('')
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Collective Identity Management
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Club Profile & Identity Editor
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Configure signature identity color, contrast calculation, curatorial narrative, and laureate achievements.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Color Picker & Live Contrast Preview */}
        <div className="p-6 bg-paper border border-[#C9D0D4] space-y-6">
          <div className="flex items-center gap-2 border-b border-[#C9D0D4] pb-3">
            <Palette className="h-5 w-5 text-ink-60" />
            <h3 className="font-display text-xl uppercase text-ink">
              Signature Identity Token
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <Field
                surface="admin"
                label="Hex Value (e.g. #2F4BD6)"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />

              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase text-ink-60 block">
                  Curated Architectural Palette:
                </span>
                <div className="flex flex-wrap gap-2">
                  {TOKENS.curatedPalettes.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setColor(p.hex)}
                      className="px-2.5 py-1 border border-[#C9D0D4] font-mono text-[11px] uppercase flex items-center gap-1.5 hover:bg-black/5"
                    >
                      <span className="h-2.5 w-2.5 inline-block" style={{ backgroundColor: p.hex }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Contrast Preview Box */}
            <div
              className="p-6 border-2 border-ink flex flex-col justify-between min-h-[180px]"
              style={{
                backgroundColor: contrast.eventColor,
                color: contrast.onEventColor,
              }}
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wide opacity-80 block mb-1">
                  Live Visual Subtree Preview
                </span>
                <p className="font-display text-3xl uppercase">
                  {club?.name || 'Club Identity'}
                </p>
                <p className="font-mono text-xs opacity-90 uppercase mt-1">
                  Computed --on-event: {contrast.onEventColor}
                </p>
              </div>

              <div className="pt-4 border-t border-current/20 font-mono text-[11px] uppercase flex items-center justify-between">
                <span>Ratio: {contrast.contrastRatio}:1</span>
                <span className="flex items-center gap-1 font-bold">
                  {contrast.isAANormal ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>WCAG AA PASS</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>FAIL (&lt; 4.5:1)</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Activities */}
        <div className="p-6 bg-paper border border-[#C9D0D4] space-y-6">
          <h3 className="font-display text-xl uppercase text-ink border-b border-[#C9D0D4] pb-3">
            Narrative & Directives
          </h3>

          <Field
            surface="admin"
            multiline
            rows={4}
            label="Curatorial About Statement"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />

          <Field
            surface="admin"
            multiline
            rows={4}
            label="What We Do / Activities Statement"
            value={whatWeDo}
            onChange={(e) => setWhatWeDo(e.target.value)}
          />
        </div>

        {/* Laurels & Achievements */}
        <div className="p-6 bg-paper border border-[#C9D0D4] space-y-4">
          <h3 className="font-display text-xl uppercase text-ink border-b border-[#C9D0D4] pb-3">
            Club Distinctions & Laurels
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              placeholder="Add distinction statement..."
              className="flex-1 bg-paper border border-[#C9D0D4] px-3 py-2 font-body text-xs focus:outline-none"
            />
            <Button
              type="button"
              surface="admin"
              variant="secondary"
              size="sm"
              onClick={handleAddAchievement}
            >
              + Add
            </Button>
          </div>

          <ul className="space-y-2 pt-2">
            {achievements.map((ach, idx) => (
              <li
                key={idx}
                className="p-3 border border-[#C9D0D4] flex items-center justify-between gap-3 font-body text-xs"
              >
                <span>{ach}</span>
                <button
                  type="button"
                  onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                  className="font-mono text-xs text-[#A32828] hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            surface="admin"
            size="lg"
            loading={updateMutation.isPending}
            icon={<Save className="h-4 w-4" />}
          >
            Save Profile Updates
          </Button>
        </div>
      </form>
    </div>
  )
}
