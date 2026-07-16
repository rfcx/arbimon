import { type FastifyRequest } from 'fastify'
import { describe, expect, test } from 'vitest'

import { authenticate } from './authenticate'

const makeReq = (decoded: Record<string, unknown>): FastifyRequest =>
  ({ jwtDecode: async () => decoded } as unknown as FastifyRequest)

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
})
