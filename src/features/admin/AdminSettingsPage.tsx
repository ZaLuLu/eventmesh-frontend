// Hallmark macrostructure: AdminConsole-Settings
import React, { useState, useEffect } from 'react'
import {
  FloppyDisk,
  GlobeHemisphereEast,
  PaperPlaneTilt,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  Clock,
  Sparkle,
  Terminal,
} from '@phosphor-icons/react'
import { useOrg } from '@/hooks/useOrg'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, SyncRun, TestEmailRequest, TestEmailResponse } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
import { Modal } from '@/design-system/primitives/Modal'
import { useToast } from '@/design-system/primitives/Toast'
import { formatDate } from '@/lib/format'

const SUPPORTED_CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Pune', 'Chennai',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Chandigarh', 'Indore',
  'Coimbatore', 'Bhubaneswar', 'Goa', 'Nagpur', 'Lucknow', 'Thiruvananthapuram',
  'Visakhapatnam', 'Bhopal', 'Vadodara', 'Guwahati', 'Dehradun'
]

export const AdminSettingsPage: React.FC = () => {
  const { organization } = useOrg()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'governance' | 'scraper' | 'email'>('governance')

  // Governance Form State
  const [orgName, setOrgName] = useState('')
  const [tagline, setTagline] = useState('')
  const [organizerLabel, setOrganizerLabel] = useState('Club')
  const [memberLabel, setMemberLabel] = useState('Student')
  const [requireApproval, setRequireApproval] = useState(false)
  const [segments, setSegments] = useState<string[]>([])

  // Scraper State
  const [syncMode, setSyncMode] = useState<'incremental' | 'full'>('incremental')
  const [selectedLogRun, setSelectedLogRun] = useState<SyncRun | null>(null)

  // Email Test State
  const [emailRecipient, setEmailRecipient] = useState('admin@eventmesh.internal')
  const [emailTemplate, setEmailTemplate] = useState<TestEmailRequest['template']>('event_ticket')
  const [lastEmailResult, setLastEmailResult] = useState<TestEmailResponse | null>(null)

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

  const updateOrgMutation = useMutation({
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

  // Scraper queries & mutations
  const { data: syncRuns = [], isLoading: isLoadingSyncRuns } = useQuery({
    queryKey: ['system', 'syncRuns'],
    queryFn: () => api.system.listSyncRuns(),
    refetchInterval: activeTab === 'scraper' ? 5000 : false,
  })

  const triggerSyncMutation = useMutation({
    mutationFn: (mode: 'incremental' | 'full') => api.system.triggerSync({ mode }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system', 'syncRuns'] })
      toast({
        title: 'Sync Dispatched',
        message: data.message,
        type: 'success',
      })
    },
    onError: (err: any) => {
      toast({ title: 'Sync Trigger Failed', message: err.message, type: 'error' })
    },
  })

  // Email test mutation
  const sendEmailMutation = useMutation({
    mutationFn: (payload: TestEmailRequest) => api.system.sendTestEmail(payload),
    onSuccess: (data) => {
      setLastEmailResult(data)
      toast({
        title: 'Test Email Dispatched',
        message: `Template delivered to ${data.recipient}. Message ID: ${data.messageId}`,
        type: 'success',
      })
    },
    onError: (err: any) => {
      toast({ title: 'Dispatch Failed', message: err.message, type: 'error' })
    },
  })

  const handleSaveGovernance = (e: React.FormEvent) => {
    e.preventDefault()
    updateOrgMutation.mutate({
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

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault()
    sendEmailMutation.mutate({
      recipient: emailRecipient,
      template: emailTemplate,
    })
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          System Customization & Diagnostics
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Federation System & Diagnostics
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Configure organization identity, supervise the 23-city automated crawler pipeline, and test SMTP email dispatch.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2 rounded-btn text-small font-medium transition-colors ${
            activeTab === 'governance'
              ? 'bg-accent text-on-accent'
              : 'text-text-2 hover:text-text hover:bg-subtle'
          }`}
        >
          Institutional Governance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scraper')}
          className={`px-4 py-2 rounded-btn text-small font-medium transition-colors inline-flex items-center gap-2 ${
            activeTab === 'scraper'
              ? 'bg-accent text-on-accent'
              : 'text-text-2 hover:text-text hover:bg-subtle'
          }`}
        >
          <GlobeHemisphereEast size={16} weight="bold" />
          23-City Scraper & Sync
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-btn text-small font-medium transition-colors inline-flex items-center gap-2 ${
            activeTab === 'email'
              ? 'bg-accent text-on-accent'
              : 'text-text-2 hover:text-text hover:bg-subtle'
          }`}
        >
          <PaperPlaneTilt size={16} weight="bold" />
          Email Diagnostics
        </button>
      </div>

      {/* TAB 1: GOVERNANCE & TERMINOLOGY */}
      {activeTab === 'governance' && (
        <form onSubmit={handleSaveGovernance} className="space-y-6">
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
              loading={updateOrgMutation.isPending}
              icon={<FloppyDisk size={16} weight="bold" />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: 23-CITY SCRAPER & FEDERATION SYNC */}
      {activeTab === 'scraper' && (
        <div className="space-y-6">
          {/* Active Cities Card */}
          <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-h3 font-semibold text-text">
                  Federated Ingestion Engine (23 Metros)
                </h3>
                <p className="text-small text-text-2 mt-0.5">
                  High-speed parallel workers continuously aggregate developer hackathons, engineering meetups, and conferences across Tier-1 and Tier-2 technology hubs.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Select
                  surface="admin"
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value as any)}
                  options={[
                    { value: 'incremental', label: 'Incremental Delta (Fast)' },
                    { value: 'full', label: 'Full Reconciliation (Deep)' },
                  ]}
                />
                <Button
                  surface="admin"
                  size="sm"
                  loading={triggerSyncMutation.isPending}
                  icon={<ArrowsClockwise size={16} weight="bold" />}
                  onClick={() => triggerSyncMutation.mutate(syncMode)}
                >
                  Dispatch Sync
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-line">
              <span className="text-caption text-text-3 font-semibold block mb-2">
                ACTIVE MONITOR NODES ({SUPPORTED_CITIES.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORTED_CITIES.map((city) => (
                  <span
                    key={city}
                    className="text-xs font-mono px-2 py-0.5 bg-subtle border border-line rounded text-text-2"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sync Runs History */}
          <div className="bg-surface border border-line rounded-panel overflow-hidden">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <h4 className="text-body font-semibold text-text">
                Recent Crawler Runs & Audit Logs
              </h4>
              <span className="text-caption text-text-3 font-mono">
                {syncRuns.length} recorded executions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-small min-w-[700px]">
                <thead>
                  <tr className="border-b border-line bg-subtle text-caption text-text-2">
                    <th className="py-2.5 px-4 font-semibold">Run ID</th>
                    <th className="py-2.5 px-4 font-semibold">Mode</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Nodes / Ingested</th>
                    <th className="py-2.5 px-4 font-semibold">Started At</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Logs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {isLoadingSyncRuns ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-3">
                        Loading sync execution logs...
                      </td>
                    </tr>
                  ) : syncRuns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-3">
                        No scraper runs recorded yet. Click Dispatch Sync to initiate the first run.
                      </td>
                    </tr>
                  ) : (
                    syncRuns.map((run) => (
                      <tr key={run.id} className="hover:bg-subtle/50">
                        <td className="py-3 px-4 font-mono text-accent text-caption font-bold">
                          {run.id}
                        </td>
                        <td className="py-3 px-4 uppercase text-xs font-mono text-text-2">
                          {run.mode}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-caption px-2 py-0.5 rounded-full border font-medium ${
                              run.status === 'success'
                                ? 'bg-success/10 text-success border-success/30'
                                : run.status === 'running'
                                ? 'bg-warning/10 text-warning border-warning/30 animate-pulse'
                                : 'bg-danger/10 text-danger border-danger/30'
                            }`}
                          >
                            {run.status === 'success' ? (
                              <CheckCircle size={12} weight="bold" />
                            ) : run.status === 'running' ? (
                              <Clock size={12} weight="bold" />
                            ) : (
                              <WarningCircle size={12} weight="bold" />
                            )}
                            {run.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-caption">
                          {run.citiesCount} cities / <strong className="text-text">{run.eventsIngested} events</strong>
                        </td>
                        <td className="py-3 px-4 text-text-2 font-mono text-caption">
                          {formatDate(run.startedAt, 'medium')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            surface="admin"
                            size="dense"
                            variant="secondary"
                            icon={<Terminal size={12} />}
                            onClick={() => setSelectedLogRun(run)}
                          >
                            Inspect Log
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL DIAGNOSTICS */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="p-5 bg-surface border border-line rounded-panel space-y-4">
            <h3 className="text-h3 font-semibold text-text">
              SMTP Test Mailer & Notification Verification
            </h3>
            <p className="text-small text-text-2">
              Dispatch a live transactional template email through your configured SMTP service (Postmark / SendGrid / AWS SES) to verify deliverability, DKIM alignment, and HTML formatting.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  surface="admin"
                  label="Recipient Email Address"
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="e.g. lead@devcraft.org"
                />

                <Select
                  surface="admin"
                  label="Transactional Email Template"
                  required
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value as any)}
                  options={[
                    { value: 'event_ticket', label: '1. Event Ticket Confirmation (QR Pass)' },
                    { value: 'organizer_invite', label: '2. Staff & Club Invitations' },
                    { value: 'withdrawal_processed', label: '3. Bank Withdrawal & UTR Notice' },
                    { value: 'certificate_issued', label: '4. Cryptographic Certificate Proof' },
                    { value: 'system_alert', label: '5. SuperAdmin Security Alert' },
                  ]}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-line">
                <Button
                  type="submit"
                  surface="admin"
                  size="sm"
                  loading={sendEmailMutation.isPending}
                  icon={<PaperPlaneTilt size={16} weight="bold" />}
                >
                  Dispatch Test Mail
                </Button>
              </div>
            </form>
          </div>

          {/* Last Delivery Status Card */}
          {lastEmailResult && (
            <div className="p-5 bg-success/10 border border-success/30 rounded-panel space-y-2">
              <div className="flex items-center gap-2 text-success font-semibold">
                <CheckCircle size={20} weight="bold" />
                <span>Message Accepted by Upstream SMTP Gateway</span>
              </div>
              <div className="text-small text-text font-mono space-y-1">
                <p><strong>Recipient:</strong> {lastEmailResult.recipient}</p>
                <p><strong>Template:</strong> {lastEmailResult.template}</p>
                <p><strong>Message ID:</strong> {lastEmailResult.messageId}</p>
                <p><strong>Delivered At:</strong> {formatDate(lastEmailResult.sentAt, 'medium')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Excerpt Modal */}
      <Modal
        isOpen={Boolean(selectedLogRun)}
        onClose={() => setSelectedLogRun(null)}
        title={`Execution Log: ${selectedLogRun?.id || ''}`}
      >
        {selectedLogRun && (
          <div className="space-y-4">
            <div className="p-3 bg-subtle border border-line rounded-btn font-mono text-caption space-y-1">
              <div>Mode: <strong>{selectedLogRun.mode}</strong></div>
              <div>Status: <strong>{selectedLogRun.status}</strong></div>
              <div>Ingested: <strong>{selectedLogRun.eventsIngested} events</strong> across {selectedLogRun.citiesCount} nodes</div>
              <div>Triggered by: <strong>{selectedLogRun.triggeredBy}</strong></div>
            </div>

            <div>
              <span className="text-caption text-text-3 font-semibold block mb-1">
                EXECUTION TELEMETRY
              </span>
              <pre className="p-3 bg-surface text-text font-mono text-xs rounded-btn border border-line overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60">
                {selectedLogRun.logExcerpt || 'Worker telemetry stream closed successfully. 0 critical errors.'}
              </pre>
            </div>

            <div className="flex justify-end">
              <Button surface="admin" size="sm" onClick={() => setSelectedLogRun(null)}>
                Close Log
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
