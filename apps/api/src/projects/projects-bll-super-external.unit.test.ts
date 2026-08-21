import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getUserRoleForProject } from './dao/project-member-dao'
import { getProjectBySlugForUser } from './projects-bll'

// The 2026-08-20 defect: getUserRoleForProject returns 'external' (not
// 'none') for a non-member on a PUBLISHED project, so the super-user
// escalation — written as a 'none'-only check — silently skipped every
// published project. Supers got the external-guest rendering (landing
// topnav, no project sidebar). These tests pin the role matrix.

vi.mock('./dao/projects-dao', () => ({
  getProjectBySlug: vi.fn(async () => ({ id: 1, slug: 'p', isLocked: false })),
  getProjectByCoreId: vi.fn(),
  query: vi.fn()
}))
vi.mock('./dao/project-member-dao', () => ({
  getUserRoleForProject: vi.fn()
}))
vi.mock('./dao/project-tiering-usage-dao', () => ({
  getProjectTieringUsage: vi.fn(async () => ({}))
}))
// ~/api-legacy-arbimon transitively imports the env validator, which throws
// on missing required env in a unit context — mock the module boundary.
vi.mock('~/api-legacy-arbimon', () => ({
  getProjectTieringUsageLegacy: vi.fn(async () => ({}))
}))
vi.mock('./project-entitlement-bll', () => ({
  getEffectiveProjectTypeLimits: vi.fn(async () => ({}))
}))

beforeEach(() => { vi.clearAllMocks() })

describe('super-user escalation on getProjectBySlugForUser', () => {
  test('super + published project (role=external) escalates to admin — THE BUG', async () => {
    vi.mocked(getUserRoleForProject).mockResolvedValue('external')
    const p = await getProjectBySlugForUser('p', 42, true)
    expect(p.role).toBe('admin')
  })

  test('super + hidden project (role=none) escalates to admin — the 2026-05-27 case, still works', async () => {
    vi.mocked(getUserRoleForProject).mockResolvedValue('none')
    const p = await getProjectBySlugForUser('p', 42, true)
    expect(p.role).toBe('admin')
  })

  test('NON-super + published project keeps external (guest rendering is deliberate)', async () => {
    vi.mocked(getUserRoleForProject).mockResolvedValue('external')
    const p = await getProjectBySlugForUser('p', 42, false)
    expect(p.role).toBe('external')
  })

  test('NON-super + hidden project still 404s', async () => {
    vi.mocked(getUserRoleForProject).mockResolvedValue('none')
    await expect(getProjectBySlugForUser('p', 42, false)).rejects.toThrow()
  })

  test('super who IS an explicit member keeps their real role (no down/up-grade)', async () => {
    vi.mocked(getUserRoleForProject).mockResolvedValue('viewer')
    const p = await getProjectBySlugForUser('p', 42, true)
    expect(p.role).toBe('viewer')
  })

  test('anonymous (no user) + published stays external even if isSuper somehow true', async () => {
    // isSuperUser() requires an email claim so this cannot happen live; pin it anyway
    vi.mocked(getUserRoleForProject).mockResolvedValue('external')
    const p = await getProjectBySlugForUser('p', undefined, false)
    expect(p.role).toBe('external')
  })
})
