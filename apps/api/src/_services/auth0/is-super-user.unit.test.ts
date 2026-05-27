import { type FastifyRequest } from 'fastify'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('~/env', () => ({ env: { SUPER_USER_EMAILS: '' } }))

const makeReq = (email?: string): FastifyRequest =>
  ({ userToken: email === undefined ? null : { email, idAuth0: 'auth0|x', firstName: '', lastName: '' } } as unknown as FastifyRequest)

describe('isSuperUser', () => {
  let env: { SUPER_USER_EMAILS?: string }
  let isSuperUser: (req: FastifyRequest) => boolean

  beforeEach(async () => {
    vi.resetModules()
    ;({ env } = await import('~/env'))
    ;({ isSuperUser } = await import('./is-super-user'))
    env.SUPER_USER_EMAILS = 'support@rfcx.org,scientist-super@rfcx.org'
  })

  afterEach(() => { env.SUPER_USER_EMAILS = '' })

  test('returns true when token email is on the allow-list', () => {
    expect(isSuperUser(makeReq('support@rfcx.org'))).toBe(true)
    expect(isSuperUser(makeReq('scientist-super@rfcx.org'))).toBe(true)
  })

  test('returns false when token email is not on the allow-list', () => {
    expect(isSuperUser(makeReq('cathcollins89@gmail.com'))).toBe(false)
  })

  test('returns false when no Authorization / no token', () => {
    expect(isSuperUser(makeReq(undefined))).toBe(false)
  })

  test('returns false when SUPER_USER_EMAILS env is empty', () => {
    env.SUPER_USER_EMAILS = ''
    expect(isSuperUser(makeReq('support@rfcx.org'))).toBe(false)
  })

  test('is case-sensitive (matches how require-super.ts compares)', () => {
    expect(isSuperUser(makeReq('SUPPORT@rfcx.org'))).toBe(false)
  })
})
