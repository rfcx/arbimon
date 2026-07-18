import { type FastifyRequest } from 'fastify'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('~/env', () => ({ env: { SUPER_USER_EMAILS: '' } }))

const makeReq = (masqueradeHeader?: string): FastifyRequest =>
  ({ headers: masqueradeHeader === undefined ? {} : { 'x-masquerade-email': masqueradeHeader } } as unknown as FastifyRequest)

describe('resolveMasqueradeEmail', () => {
  let env: { SUPER_USER_EMAILS?: string }
  let resolveMasqueradeEmail: (req: FastifyRequest, realEmail: string) => { email: string, masqueradedBy?: string }

  beforeEach(async () => {
    vi.resetModules()
    ;({ env } = await import('~/env'))
    ;({ resolveMasqueradeEmail } = await import('./masquerade'))
    env.SUPER_USER_EMAILS = 'support@rfcx.org,arbimon-admin@rfcx.org'
  })

  afterEach(() => { env.SUPER_USER_EMAILS = '' })

  test('no header -> real identity', () => {
    expect(resolveMasqueradeEmail(makeReq(), 'support@rfcx.org'))
      .toEqual({ email: 'support@rfcx.org' })
  })

  test('super + non-super target -> target identity with masqueradedBy', () => {
    expect(resolveMasqueradeEmail(makeReq('user@example.com'), 'support@rfcx.org'))
      .toEqual({ email: 'user@example.com', masqueradedBy: 'support@rfcx.org' })
  })

  test('NON-super with header -> header ignored, real identity', () => {
    expect(resolveMasqueradeEmail(makeReq('user@example.com'), 'someone@gmail.com'))
      .toEqual({ email: 'someone@gmail.com' })
  })

  test('super target -> refused (no lateral escalation), real identity', () => {
    expect(resolveMasqueradeEmail(makeReq('arbimon-admin@rfcx.org'), 'support@rfcx.org'))
      .toEqual({ email: 'support@rfcx.org' })
  })

  test('self target -> no-op, real identity without masqueradedBy', () => {
    expect(resolveMasqueradeEmail(makeReq('support@rfcx.org'), 'support@rfcx.org'))
      .toEqual({ email: 'support@rfcx.org' })
  })

  test('empty / whitespace header -> real identity', () => {
    expect(resolveMasqueradeEmail(makeReq(''), 'support@rfcx.org'))
      .toEqual({ email: 'support@rfcx.org' })
    expect(resolveMasqueradeEmail(makeReq('   '), 'support@rfcx.org'))
      .toEqual({ email: 'support@rfcx.org' })
  })

  test('empty SUPER_USER_EMAILS -> nobody can masquerade', () => {
    env.SUPER_USER_EMAILS = ''
    expect(resolveMasqueradeEmail(makeReq('user@example.com'), 'support@rfcx.org'))
      .toEqual({ email: 'support@rfcx.org' })
  })

  test('M2M-style empty real email -> header ignored', () => {
    expect(resolveMasqueradeEmail(makeReq('user@example.com'), ''))
      .toEqual({ email: '' })
  })
})
