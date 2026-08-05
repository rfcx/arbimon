import { type FastifyReply, type FastifyRequest } from 'fastify'
import { QueryTypes } from 'sequelize'

import { getSequelize } from '~/db'
import { env } from '~/env'

/**
 * Server-side PostHog capture for /super (admin) MUTATIONS — the durable
 * "who did what" audit trail (rfcx-local
 * `AUDIT-arbimon-posthog-instrumentation-2026-08-04.md` Phase A).
 *
 * Motivation (incident 2026-08-04 07:58 EDT): a super-UI user demotion had no
 * durable actor record; attribution required correlating legacy masquerade
 * polls. Every /super mutation now emits a `super_action` event carrying the
 * ACTOR EMAIL, route, target params, sanitized body, and response status.
 *
 * Design constraints:
 * - Fire-and-forget: never awaited into the request path beyond the hook's
 *   own promise; errors are swallowed (analytics must never break the API).
 * - No SDK: one HTTP POST to the PostHog capture endpoint (in-cluster or
 *   public ingest), same wire format as the legacy pageview beacon.
 * - Sanitized body: ALLOWLIST of known tier-management fields only — never
 *   forward arbitrary request bodies (they may carry PII or secrets).
 * - Disabled unless POSTHOG_CAPTURE_HOST + POSTHOG_PROJECT_TOKEN are set.
 *
 * PG MIRROR (Q-C, 2026-08-04): every event is ALSO appended to the
 * `super_action_log` table (insights DB) — durable, SQL-queryable, and
 * independent of PostHog retention. Same fire-and-forget contract: the
 * insert failure is swallowed and never blocks the response. The table is
 * append-only from the api role (INSERT-only grant).
 */

const CAPTURE_TIMEOUT_MS = 2000

// Only these body fields are ever forwarded (tier management surface).
const BODY_ALLOWLIST = [
  'accountTier',
  'additionalPremiumProjectSlots',
  'projectType',
  'isLocked',
  'role',
  'roleId',
  'userId',
  'email',
  'ranking'
] as const

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

const isEnabled = (): boolean =>
  typeof env.POSTHOG_CAPTURE_HOST === 'string' && env.POSTHOG_CAPTURE_HOST.length > 0 &&
  typeof env.POSTHOG_PROJECT_TOKEN === 'string' && env.POSTHOG_PROJECT_TOKEN.length > 0

const sanitizeBody = (body: unknown): Record<string, unknown> => {
  if (body === null || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of BODY_ALLOWLIST) {
    if (src[key] !== undefined) out[key] = src[key]
  }
  return out
}

const postEvent = async (payload: Record<string, unknown>): Promise<void> => {
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, CAPTURE_TIMEOUT_MS)
  try {
    await fetch(`${env.POSTHOG_CAPTURE_HOST ?? ''}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
  } finally {
    clearTimeout(timer)
  }
}

const insertAuditRow = async (row: {
  actorEmail: string
  method: string
  route: string
  url: string
  params: unknown
  body: Record<string, unknown>
  statusCode: number
}): Promise<void> => {
  const sequelize = getSequelize()
  await sequelize.query(
    `
      INSERT INTO super_action_log (actor_email, method, route, url, params, body, status_code)
      VALUES (:actorEmail, :method, :route, :url, :params::jsonb, :body::jsonb, :statusCode)
    `,
    {
      replacements: {
        actorEmail: row.actorEmail,
        method: row.method,
        route: row.route,
        url: row.url,
        params: JSON.stringify(row.params ?? {}),
        body: JSON.stringify(row.body),
        statusCode: row.statusCode
      },
      type: QueryTypes.INSERT
    }
  )
}

/**
 * Fastify onResponse hook for super routes. Registered per-route (super/index)
 * so it cannot accidentally observe non-admin traffic.
 */
export const captureSuperAction = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    if (!MUTATION_METHODS.has(req.method)) return

    const actorEmail = req.userToken?.email ?? 'unknown'

    // PG mirror (durable audit log) — ALWAYS on (independent of the PostHog
    // env toggle), same fire-and-forget contract.
    void insertAuditRow({
      actorEmail,
      method: req.method,
      route: req.routerPath ?? req.url,
      url: req.url,
      params: req.params ?? {},
      body: sanitizeBody(req.body),
      statusCode: reply.statusCode
    }).catch(() => { /* audit mirror must never break the API */ })

    if (!isEnabled()) return
    const payload = {
      api_key: env.POSTHOG_PROJECT_TOKEN,
      event: 'super_action',
      properties: {
        distinct_id: actorEmail,
        actor_email: actorEmail,
        method: req.method,
        // routerPath is the route TEMPLATE (e.g. /super/users/:userId/tier)
        // (fastify 3.x; becomes routeOptions.url in fastify 4+)
        route: req.routerPath ?? req.url,
        url: req.url,
        params: req.params ?? {},
        body: sanitizeBody(req.body),
        status_code: reply.statusCode,
        app: 'biodiversity-api',
        surface: 'super'
      },
      timestamp: new Date().toISOString()
    }
    // Fire and forget — do not block the response on analytics.
    void postEvent(payload).catch(() => { /* analytics must never break the API */ })
  } catch { /* analytics must never break the API */ }
}
