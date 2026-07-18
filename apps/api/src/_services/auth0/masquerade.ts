import { type FastifyRequest } from 'fastify'

import { env } from '~/env'

/**
 * Superuser masquerade (Phase 2, bio-api side).
 *
 * A SUPER user (email on `SUPER_USER_EMAILS`) may attach an
 * `X-Masquerade-Email: <target>` header to any authenticated request; the
 * request is then processed AS the target identity (userId resolution,
 * project roles, memberships — everything keyed off `userToken.email`
 * downstream).
 *
 * The header is honored ONLY when:
 *   - the REAL, verified Bearer token's email is on `SUPER_USER_EMAILS`;
 *   - the target email is NOT itself a super (no lateral escalation);
 *   - the target is non-empty and differs from the real email.
 * Otherwise the header is silently ignored (request proceeds as the real
 * user) — masquerade must fail OPEN to the real identity, never escalate.
 *
 * SECURITY PROPERTIES (all downstream, all automatic):
 *   - `require-super.ts` compares `userToken.email` to the allow-list, so a
 *     masqueraded request LOSES super API access (the email is the target's).
 *   - The `user` plugin resolves userId from the (overridden) email, so
 *     roles/memberships are the target's. Its LRU is keyed by email — no
 *     cache pollution of the super's entry.
 *   - `masqueradedBy` carries the real identity for audit logging.
 *
 * The client (website) mirrors the LEGACY masquerade session
 * (`/legacy-api/masquerade/status`, Redis-backed, started/stopped from the
 * masquerade tray) into this header — the legacy session is the single
 * source of truth for masquerade state across both stacks.
 */

export const MASQUERADE_HEADER = 'x-masquerade-email'

const superUserEmails = (): string[] =>
  env.SUPER_USER_EMAILS !== undefined && env.SUPER_USER_EMAILS !== '' ? env.SUPER_USER_EMAILS.split(',') : []

export interface MasqueradeResolution {
  /** The effective email the request should be processed as. */
  email: string
  /** Real super email when masquerading; undefined on a normal request. */
  masqueradedBy?: string
}

/**
 * Resolve the effective identity for a request given the REAL verified token
 * email. Returns the target identity iff the masquerade header is present and
 * every guard passes; otherwise the real identity.
 */
export const resolveMasqueradeEmail = (req: FastifyRequest, realEmail: string): MasqueradeResolution => {
  const raw = req.headers[MASQUERADE_HEADER]
  const target = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''
  if (target === '' || target === realEmail) return { email: realEmail }

  const supers = superUserEmails()
  // Only a real super may masquerade; never AS a super (no lateral escalation).
  if (!supers.includes(realEmail)) return { email: realEmail }
  if (supers.includes(target)) return { email: realEmail }

  return { email: target, masqueradedBy: realEmail }
}
