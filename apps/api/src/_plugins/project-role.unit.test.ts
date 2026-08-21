import fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { type ProjectRole } from '@rfcx-bio/common/roles'

vi.mock('~/env', () => ({ env: { SUPER_USER_EMAILS: '' } }))
vi.mock('@/projects/dao/project-member-dao', () => ({ getUserRoleForProject: vi.fn() }))

const method = 'GET'
const url = '/projects/:projectId/probe'

const getApp = async (opts: { email?: string, userId?: number, dbRole: ProjectRole }): Promise<FastifyInstance> => {
  vi.resetModules()
  const { env } = await import('~/env')
  env.SUPER_USER_EMAILS = 'support@rfcx.org,arbimon-admin@rfcx.org'

  const { getUserRoleForProject } = await import('@/projects/dao/project-member-dao')
  ;(getUserRoleForProject as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(opts.dbRole)

  const { projectRolePlugin } = await import('./project-role')

  const app = await fastify()
  app.decorateRequest('userToken', opts.email === undefined ? null : { email: opts.email, idAuth0: 'auth0|x', firstName: '', lastName: '' })
  app.decorateRequest('userId', opts.userId)
  await app.register(projectRolePlugin)
  app.route({ method, url, handler: async (req) => await Promise.resolve({ projectRole: req.projectRole }) })
  return app
}

afterEach(() => { vi.clearAllMocks() })
beforeEach(() => { vi.resetModules() })

test('escalates a super user with no membership (db role "none") to "admin"', async () => {
  const app = await getApp({ email: 'arbimon-admin@rfcx.org', userId: 17201, dbRole: 'none' })
  const response = await app.inject({ method, url: '/projects/1142218/probe' })
  expect(JSON.parse(response.body).projectRole).toBe('admin')
})

test('does NOT escalate a non-super user with no membership (stays "none")', async () => {
  const app = await getApp({ email: 'someone@example.com', userId: 42, dbRole: 'none' })
  const response = await app.inject({ method, url: '/projects/1142218/probe' })
  expect(JSON.parse(response.body).projectRole).toBe('none')
})

test('does NOT override a real membership role for a super user (no privilege downgrade/upgrade)', async () => {
  const app = await getApp({ email: 'arbimon-admin@rfcx.org', userId: 17201, dbRole: 'viewer' })
  const response = await app.inject({ method, url: '/projects/1142218/probe' })
  // a super user who is an explicit member keeps their actual membership role
  expect(JSON.parse(response.body).projectRole).toBe('viewer')
})

test('does NOT escalate when no projectId param is present', async () => {
  const { env } = await import('~/env')
  env.SUPER_USER_EMAILS = 'support@rfcx.org'
  const { projectRolePlugin } = await import('./project-role')
  const app = await fastify()
  app.decorateRequest('userToken', { email: 'support@rfcx.org', idAuth0: 'auth0|x', firstName: '', lastName: '' })
  app.decorateRequest('userId', 1)
  await app.register(projectRolePlugin)
  app.route({ method: 'GET', url: '/no-project', handler: async (req) => await Promise.resolve({ projectRole: req.projectRole }) })
  const response = await app.inject({ method: 'GET', url: '/no-project' })
  // default decorated value, untouched
  expect(JSON.parse(response.body).projectRole).toBe('none')
})

test('escalates a super user who is "external" on a PUBLISHED project to "admin" — the 2026-08-20 defect', async () => {
  // getUserRoleForProject returns 'external' (not 'none') for a non-member on
  // a published project, so a 'none'-only bypass silently skipped every
  // published project. Symptom: supers got the external-guest rendering
  // (landing topnav, no project sidebar).
  const app = await getApp({ email: 'arbimon-admin@rfcx.org', userId: 17201, dbRole: 'external' })
  const response = await app.inject({ method, url: '/projects/1142218/probe' })
  expect(JSON.parse(response.body).projectRole).toBe('admin')
})

test('does NOT escalate a non-super "external" visitor (guest rendering is deliberate)', async () => {
  const app = await getApp({ email: 'someone@example.com', userId: 42, dbRole: 'external' })
  const response = await app.inject({ method, url: '/projects/1142218/probe' })
  expect(JSON.parse(response.body).projectRole).toBe('external')
})
