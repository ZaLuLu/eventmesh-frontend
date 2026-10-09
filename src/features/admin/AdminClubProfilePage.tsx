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

  const targetClubId = clubId || session?.clubId || 'club-devcraft'
  const { data: club } = useClub(targetClubId)
  const updateMutation = useUpdateClub()

  const [color, setColor] = useState('#C66A4A')
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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          Collective Identity Management
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Club Profile & Identity Editor
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Configure signature identity color, contrast calculation, curatorial narrative, and laureate achievements.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Color Picker & Live Contrast Preview */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Palette className="h-4 w-4 text-accent" />
            <h3 className="text-h3 font-semibold text-text">
              Signature Identity Token
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <Field
                surface="admin"
                label="Hex Value (e.g. #C66A4A)"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />

              <div className="space-y-1.5">
                <span className="text-caption font-medium text-text-3 block">
                  Curated Architectural Palette:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TOKENS.curatedPalettes.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setColor(p.hex)}
                      className="px-2.5 py-1 border border-line rounded-btn text-caption flex items-center gap-1.5 hover:bg-subtle transition-colors"
                    >
                      <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: p.hex }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Contrast Preview Box (Small chip / preview tile) */}
            <div className="p-4 border border-line rounded-panel bg-subtle space-y-3">
              <span className="text-caption font-medium text-text-3 block">
                Contrast Calculation & Token Preview
              </span>

              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1.5 rounded-btn font-semibold text-small"
                  style={{
                    backgroundColor: contrast.eventColor,
                    color: contrast.onEventColor,
                  }}
                >
                  {club?.name || 'Club Preview'}
                </span>
                <span className="text-caption text-text-2">
                  Computed text: {contrast.onEventColor}
                </span>
              </div>

              <div className="pt-2 border-t border-line text-caption flex items-center justify-between">
                <span className="text-text-2">Contrast ratio: {contrast.contrastRatio}:1</span>
                <span className="flex items-center gap-1 font-semibold">
                  {contrast.isAANormal ? (
                    <span className="text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> WCAG AA Pass
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Fail (&lt; 4.5:1)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Activities */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text border-b border-line pb-2">
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
        <div className="p-5 bg-surface border border-line rounded-panel space-y-3">
          <h3 className="text-h3 font-semibold text-text border-b border-line pb-2">
            Club Distinctions & Laurels
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              placeholder="Add distinction statement..."
              className="flex-1 bg-surface border border-line rounded-btn px-3 py-2 text-small text-text focus:outline-none focus:border-accent"
            >
            </input>
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

          <ul className="space-y-1.5 pt-1">
            {achievements.map((ach, idx) => (
              <li
                key={idx}
                className="p-2.5 border border-line rounded-btn bg-subtle flex items-center justify-between gap-3 text-small"
              >
                <span className="text-text">{ach}</span>
                <button
                  type="button"
                  onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                  className="text-caption text-danger hover:underline"
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
            size="sm"
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
