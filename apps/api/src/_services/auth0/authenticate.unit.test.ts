import { type FastifyRequest } from 'fastify'
import { describe, expect, test, vi } from 'vitest'

import { authenticate } from './authenticate'

// authenticate.ts now imports ~/auth0/masquerade -> ~/env, which throws at
// import time when required env vars are absent (the unit-test environment).
// vi.mock is hoisted above the imports by vitest, so the mock is in place
// before ./authenticate (and thus ~/env) is evaluated. Empty
// SUPER_USER_EMAILS => masquerade never elevates, so plain-auth cases below
// are unaffected.
vi.mock('~/env', () => ({ env: { SUPER_USER_EMAILS: '' } }))

const makeReq = (decoded: Record<string, unknown>, headers: Record<string, string> = {}): FastifyRequest =>
  ({ jwtDecode: async () => decoded, headers, log: { warn: () => {} } } as unknown as FastifyRequest)

describe('authenticate', () => {
  test('user token: name/email claims map to profile fields', async () => {
    const token = await authenticate(makeReq({
      auth0_user_id: 'auth0|abc123',
      email: 'jane@rfcx.org',
      name: 'Jane Van Doe'
    }))
    expect(token.idAuth0).toBe('auth0|abc123')
    expect(token.email).toBe('jane@rfcx.org')
    expect(token.firstName).toBe('Jane')
    expect(token.lastName).toBe('Doe')
  })

  test('user token: given/family names win over name split', async () => {
    const token = await authenticate(makeReq({
      auth0_user_id: 'auth0|abc123',
      email: 'jane@rfcx.org',
      name: 'Something Else',
      given_name: 'Jane',
      family_name: 'Doe'
    }))
    expect(token.firstName).toBe('Jane')
    expect(token.lastName).toBe('Doe')
  })

  test('M2M (client-credentials) token: no name/email claims → no crash', async () => {
    // Machine tokens (e.g. ingest-service systemUser) carry only sub/azp/gty.
    const token = await authenticate(makeReq({
      sub: 'hpHA3istnb0dM6Fb9JgV6zgpsY1Rupy7@clients',
      gty: 'client-credentials'
    }))
    expect(token.idAuth0).toBe('hpHA3istnb0dM6Fb9JgV6zgpsY1Rupy7@clients')
    expect(token.email).toBeUndefined()
    expect(token.firstName).toBe('')
    expect(token.lastName).toBe('')
  })

  test('token with empty-string name → empty profile fields, no crash', async () => {
    const token = await authenticate(makeReq({
      auth0_user_id: 'auth0|xyz',
      email: 'x@rfcx.org',
      name: ''
    }))
    expect(token.firstName).toBe('')
    expect(token.lastName).toBe('')
  })

  test('X-Masquerade-Email is ignored when SUPER_USER_EMAILS is empty (default mock)', async () => {
    // With no supers configured, even a real rfcx.org token cannot masquerade.
    const token = await authenticate(makeReq(
      { auth0_user_id: 'auth0|s', email: 'support@rfcx.org', name: 'S' },
      { 'x-masquerade-email': 'target@example.com' }
    ))
    expect(token.email).toBe('support@rfcx.org')
    expect(token.masqueradedBy).toBeUndefined()
  })
})
