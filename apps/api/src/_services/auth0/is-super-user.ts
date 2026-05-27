import { type FastifyRequest } from 'fastify'

import { env } from '~/env'

/**
 * Returns true iff the authenticated request was made by an account
 * whose Auth0 email is listed in the `SUPER_USER_EMAILS` env var
 * (comma-separated).
 *
 * This is the same allow-list used by `require-super.ts` for /super/*
 * routes. Use this helper anywhere the bio-api needs to short-circuit
 * a per-project membership check for an org-level super user (e.g.
 * support staff viewing a hidden project to triage a ticket).
 *
 * Returns false if there is no Authorization header, the token has
 * no email claim, or the email is not on the allow-list.
 */
export const isSuperUser = (req: FastifyRequest): boolean => {
  const email = req.userToken?.email
  if (email === undefined) return false
  const superUserEmails = env.SUPER_USER_EMAILS !== undefined && env.SUPER_USER_EMAILS !== '' ? env.SUPER_USER_EMAILS.split(',') : []
  return superUserEmails.includes(email)
}
