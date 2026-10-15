// Hallmark macrostructure: AdminConsole-ClubProfile
import React, { useState, useEffect } from 'react'
import { Palette, CheckCircle, Warning, FloppyDisk, Users, Trash, Plus } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useClub, useUpdateClub } from '@/hooks/useClubs'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { getContrastSummary } from '@/lib/contrast'
import { TOKENS } from '@/design-system/tokens'
import { useToast } from '@/design-system/primitives/Toast'
import type { PersonReference } from '@/api/contracts/organization'

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

  // Club Leadership / Member details for the Club About Page
  const [coordinators, setCoordinators] = useState<PersonReference[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [newMemberBio, setNewMemberBio] = useState('')
  const [newMemberPhoto, setNewMemberPhoto] = useState('')

  useEffect(() => {
    if (club) {
      setColor(club.color)
      setAbout(club.about)
      setWhatWeDo(club.whatWeDo)
      setAchievements(club.achievements || [])
      setCoordinators([
        ...(club.studentCoordinators || []),
        ...(club.coordinators || []),
      ])
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
          studentCoordinators: coordinators,
          coordinators: [],
        },
      })
      toast({
        title: 'Club Profile & Roster Updated',
        message: 'Member details and narrative successfully saved to the club about page.',
        type: 'success',
      })
    } catch {
      toast({ title: 'Update failed', type: 'error' })
    }
  }

  const handleAddMember = () => {
    if (newMemberName.trim() && newMemberRole.trim()) {
      setCoordinators([
        ...coordinators,
        {
          name: newMemberName.trim(),
          role: newMemberRole.trim(),
          bio: newMemberBio.trim() || undefined,
          photo: newMemberPhoto.trim() || undefined,
        },
      ])
      setNewMemberName('')
      setNewMemberRole('')
      setNewMemberBio('')
      setNewMemberPhoto('')
    }
  }

  const handleRemoveMember = (idx: number) => {
    setCoordinators(coordinators.filter((_, i) => i !== idx))
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
                      <CheckCircle size={14} weight="bold" /> WCAG AA Pass
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">
                      <Warning size={14} weight="bold" /> Fail (&lt; 4.5:1)
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

        {/* Club Leadership & Member Roster (Showcased on Club About Page) */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div>
              <h3 className="text-h3 font-semibold text-text flex items-center gap-2">
                <Users size={18} className="text-accent" />
                <span>Club Leadership & Team Roster</span>
              </h3>
              <p className="text-caption text-text-3 mt-0.5">
                Team members and coordinators displayed on the public Club About page.
              </p>
            </div>
            <span className="text-caption font-mono text-accent">
              {coordinators.length} Members
            </span>
          </div>

          {/* Add New Member Input Grid */}
          <div className="p-4 rounded-btn border border-line bg-subtle space-y-3">
            <span className="text-caption font-semibold text-text block">
              Add New Organizer / Club Lead
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-caption text-text-2 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full bg-surface border border-line rounded-btn px-3 py-1.5 text-small text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-caption text-text-2 block mb-1">Role / Designation *</label>
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="e.g. President & Systems Lead"
                  className="w-full bg-surface border border-line rounded-btn px-3 py-1.5 text-small text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-caption text-text-2 block mb-1">About Them / Short Bio</label>
              <input
                type="text"
                value={newMemberBio}
                onChange={(e) => setNewMemberBio(e.target.value)}
                placeholder="e.g. Third-year robotics researcher specializing in autonomous drones and computer vision."
                className="w-full bg-surface border border-line rounded-btn px-3 py-1.5 text-small text-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 pt-1">
              <div className="flex-1">
                <label className="text-caption text-text-2 block mb-1">Photo URL (optional)</label>
                <input
                  type="text"
                  value={newMemberPhoto}
                  onChange={(e) => setNewMemberPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-surface border border-line rounded-btn px-3 py-1.5 text-small text-text focus:outline-none focus:border-accent"
                />
              </div>

              <Button
                type="button"
                surface="admin"
                variant="secondary"
                size="sm"
                icon={<Plus size={14} weight="bold" />}
                onClick={handleAddMember}
                disabled={!newMemberName.trim() || !newMemberRole.trim()}
              >
                Add Member
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2 pt-2">
            {coordinators.length === 0 ? (
              <p className="text-caption text-text-3 italic text-center py-4">
                No custom member details registered yet. Default founding coordinators will be displayed until you add members.
              </p>
            ) : (
              coordinators.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-line rounded-btn bg-surface flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold flex items-center justify-center shrink-0 overflow-hidden text-xs">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-small text-text">{member.name}</span>
                        <span className="text-caption font-mono px-2 py-0.5 rounded-full bg-subtle border border-line text-text-2">
                          {member.role}
                        </span>
                      </div>
                      {member.bio && (
                        <p className="text-caption text-text-2 line-clamp-2 mt-0.5">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="text-danger hover:text-danger/80 p-1.5 rounded-btn hover:bg-danger/10 transition-colors shrink-0"
                    title="Remove member"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            surface="admin"
            size="sm"
            loading={updateMutation.isPending}
            icon={<FloppyDisk size={16} weight="bold" />}
          >
            Save Profile Updates
          </Button>
        </div>
      </form>
    </div>
  )
}
