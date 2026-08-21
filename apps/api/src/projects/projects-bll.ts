import QuickLRU from 'quick-lru'

import { type ProjectEntitlementSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-entitlement-summary'
import { type ProjectUploadLimitSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-upload-limit-summary'
import { type LocationProjectWithRole, type ProjectsGeoResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getProjectTieringUsageLegacy } from '~/api-legacy-arbimon'
import { BioNotFoundError } from '~/errors'
import { getUserRoleForProject } from './dao/project-member-dao'
import { getProjectTieringUsage } from './dao/project-tiering-usage-dao'
import { getProjectByCoreId, getProjectBySlug, query } from './dao/projects-dao'
import { getEffectiveProjectTypeLimits } from './project-entitlement-bll'

export const getProjects = async (limit?: number, offset?: number): Promise<ProjectsResponse> => {
  return await query<Project>({ status: ['listed', 'published'] }, { limit, offset })
}

const projectsGeoCache = new QuickLRU<string, ProjectsGeoResponse>({
  maxSize: 10,
  maxAge: 900000 // 15 minutes
})

export const getProjectsGeo = async (limit?: number, offset?: number): Promise<ProjectsGeoResponse> => {
  const cacheKey = JSON.stringify({ limit, offset })
  const cacheHit = projectsGeoCache.get(cacheKey)
  if (cacheHit !== undefined) {
    return cacheHit
  }

  const projects = await query<Project>({ status: ['listed', 'published'] }, { limit, offset, attributesSet: 'geo' })
  projectsGeoCache.set(cacheKey, projects)
  return projects
}

export const getProjectBySlugForUser = async (slug: string, userId: number | undefined, isSuper: boolean = false): Promise<LocationProjectWithRole> => {
  const project = await getProjectBySlug(slug)
  if (project === undefined) { throw BioNotFoundError() }

  let role = await getUserRoleForProject(userId, project.id)
  // Super-user bypass: org-level support/scientist accounts (allow-list in
  // SUPER_USER_EMAILS) are escalated to 'admin' on any project they aren't
  // an explicit member of. Mirrors the legacy arbimon `is_super` behaviour
  // (where the legacy app treats super users as admins on every project) so
  // support staff can triage tickets against hidden / unlisted projects.
  // We deliberately escalate to 'admin' rather than 'owner' so that
  // owner-only operations (e.g. project deletion) still require an actual
  // owner membership row.
  //
  // 'external' is included (2026-08-20): getUserRoleForProject returns
  // 'external', not 'none', for a non-member on a PUBLISHED project — so the
  // original 'none'-only check silently skipped the bypass on every published
  // project. The visible symptom: a super opening a published project they
  // aren't a member of got the external-guest rendering (landing TOPNAV
  // instead of the project SIDEBAR, store.project cleared by
  // storeMemberGuard). The 2026-05-27 fix was only ever verified against a
  // hidden project, which is why this survived. Ordinary visitors keep
  // 'external' — the guest rendering is deliberate for them.
  if ((role === 'none' || role === 'external') && isSuper) { role = 'admin' }
  if (role === 'none') { throw BioNotFoundError() }

  const usage = await getProjectTieringUsage(project.id)

  return { ...project, role, usage }
}

export const getProjectEntitlementSummaryBySlug = async (slug: string): Promise<ProjectEntitlementSummaryResponse> => {
  const project = await getProjectBySlug(slug)
  if (project === undefined) { throw BioNotFoundError() }

  const projectType = project.projectType ?? 'free'
  // Effective limits (Pro-owner exemption applied) — legacy + clients see the
  // caps that will actually be enforced for THIS project.
  const limits = await getEffectiveProjectTypeLimits(project.id, projectType)

  return {
    slug: project.slug,
    projectType,
    isLocked: project.isLocked,
    limits
  }
}

export const getProjectUploadLimitSummaryByCoreId = async (idCore: string, token: string): Promise<ProjectUploadLimitSummaryResponse> => {
  const project = await getProjectByCoreId(idCore)
  if (project === undefined) { throw BioNotFoundError() }

  const projectType: NonNullable<Project['projectType']> = project.projectType ?? 'free'
  const legacyUsage = await getProjectTieringUsageLegacy(token, project.slug)
  const recordingMinutesCount = Number(legacyUsage.recordingMinutesCount ?? 0)

  // Unlimited audio uploads on EVERY tier (operator decision 2026-08-17 —
  // pricing Recordings row). The per-project recording-library limit is
  // REMOVED as policy, not merely NULL-by-data: this path no longer consults
  // project_type_limit.recording_minutes_limit, so re-arming that column
  // cannot silently re-gate ingest. Usage is still reported for display.
  const recordingMinutesLimit = null

  return {
    idCore: project.idCore,
    slug: project.slug,
    projectType,
    isLocked: project.isLocked,
    recordingMinutesCount,
    recordingMinutesLimit,
    remainingRecordingMinutes: null
  }
}
