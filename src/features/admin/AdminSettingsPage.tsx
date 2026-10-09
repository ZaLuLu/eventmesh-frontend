import React, { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useOrg } from '@/hooks/useOrg'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminSettingsPage: React.FC = () => {
  const { organization } = useOrg()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [orgName, setOrgName] = useState('')
  const [tagline, setTagline] = useState('')
  const [organizerLabel, setOrganizerLabel] = useState('Club')
  const [memberLabel, setMemberLabel] = useState('Student')
  const [requireApproval, setRequireApproval] = useState(false)
  const [segments, setSegments] = useState<string[]>([])

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name)
      setTagline(organization.tagline || '')
      setOrganizerLabel(organization.labels.organizer)
      setMemberLabel(organization.labels.member)
      setRequireApproval(organization.settings.requireEventApproval)
      setSegments(organization.labels.audienceSegments || [])
    }
  }, [organization])

  const updateMutation = useMutation({
    mutationFn: (updates: any) => api.organizations.updateOrganization('org-1', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      toast({
        title: 'Settings Saved',
        message: 'Federation labels and governance preferences preserved.',
        type: 'success',
      })
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      name: orgName,
      tagline,
      labels: {
        organizer: organizerLabel,
        member: memberLabel,
        audienceSegments: segments,
      },
      settings: {
        requireEventApproval: requireApproval,
        defaultCurrency: 'INR',
        allowPaidEvents: false,
      },
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          System Customization & Terminology
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Federation Configuration
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Configure organization identity, configurable labels (Clubs/Chapters, Students/Fellows), and approval pipelines.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text border-b border-line pb-2">
            Institutional Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              surface="admin"
              label="Organization Name"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <Field
              surface="admin"
              label="Motto / Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
        </div>

        {/* Configurable Terminology Labels */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text border-b border-line pb-2">
            Configurable Labels (Backend Agnostic)
          </h3>
          <p className="text-caption text-text-2">
            EventMesh adapts to any collective (colleges, corporations, or open communities).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              surface="admin"
              label="Organizer Term (Singular)"
              value={organizerLabel}
              onChange={(e) => setOrganizerLabel(e.target.value)}
              placeholder="e.g. Club, Guild, Chapter, Department"
            />
            <Field
              surface="admin"
              label="Member Term (Singular)"
              value={memberLabel}
              onChange={(e) => setMemberLabel(e.target.value)}
              placeholder="e.g. Student, Fellow, Employee, Member"
            />
          </div>
        </div>

        {/* Governance Settings */}
        <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text border-b border-line pb-2">
            Governance & Approval Pipeline
          </h3>

          <label className="flex items-center gap-2 cursor-pointer text-small text-text">
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="h-4 w-4 rounded text-accent"
            />
            <span>Require President approval for all club event publishes</span>
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            surface="admin"
            size="sm"
            loading={updateMutation.isPending}
            icon={<Save className="h-4 w-4" />}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
