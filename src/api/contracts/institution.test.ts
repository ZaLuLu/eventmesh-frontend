import { describe, it, expect } from 'vitest'
import { api } from '@/api'
import { InstitutionCandidate } from './organization'

describe('Institution Verification & Revocation Contract', () => {
  it('exposes revokeInstitution in the organizations API port', () => {
    expect(typeof api.organizations.revokeInstitution).toBe('function')
  })

  it('exposes verifyInstitution and rejectInstitution in the organizations API port', () => {
    expect(typeof api.organizations.verifyInstitution).toBe('function')
    expect(typeof api.organizations.rejectInstitution).toBe('function')
  })

  it('executes revokeInstitution and returns updated non-institution status', async () => {
    if (!api.organizations.revokeInstitution) {
      throw new Error('revokeInstitution is not defined on organizations API')
    }

    const res: InstitutionCandidate = await api.organizations.revokeInstitution(
      'apex-institute',
      'Accreditation expired'
    )

    expect(res).toBeDefined()
    expect(res.slug).toBe('apex-institute')
    expect(res.is_institution).toBe(false)
    expect(res.institution_rejection_reason).toBe('Accreditation expired')
  })

  it('preserves valid InstitutionCandidate structural contract', async () => {
    if (!api.organizations.revokeInstitution) {
      throw new Error('revokeInstitution is not defined on organizations API')
    }

    const res = await api.organizations.revokeInstitution('test-campus')
    expect(res).toHaveProperty('id')
    expect(res).toHaveProperty('name')
    expect(res).toHaveProperty('slug')
    expect(res).toHaveProperty('is_institution', false)
    expect(Array.isArray(res.domains)).toBe(true)
  })
})
