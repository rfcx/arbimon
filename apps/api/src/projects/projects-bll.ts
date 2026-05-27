import QuickLRU from 'quick-lru'

import { type ProjectEntitlementSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-entitlement-summary'
import { type ProjectUploadLimitSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-upload-limit-summary'
import { type LocationProjectWithRole, type ProjectsGeoResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getProjectTieringUsageLegacy } from '~/api-legacy-arbimon'
import { BioNotFoundError } from '~/errors'
import { getProjectTypeLimitMap } from '../tiering/tier-limit-bll'
import { getUserRoleForProject } from './dao/project-member-dao'
import { getProjectTieringUsage } from './dao/project-tiering-usage-dao'
import { getProjectByCoreId, getProjectBySlug, query } from './dao/projects-dao'

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
  if (role === 'none' && isSuper) { role = 'admin' }
  if (role === 'none') { throw BioNotFoundError() }

  const usage = await getProjectTieringUsage(project.id)

  return { ...project, role, usage }
}

export const getProjectEntitlementSummaryBySlug = async (slug: string): Promise<ProjectEntitlementSummaryResponse> => {
  const project = await getProjectBySlug(slug)
  if (project === undefined) { throw BioNotFoundError() }

  const projectType = project.projectType ?? 'free'
  const projectTypeLimitMap = await getProjectTypeLimitMap()

  return {
    slug: project.slug,
    projectType,
    isLocked: project.isLocked,
    limits: projectTypeLimitMap[projectType]
  }
}

export const getProjectUploadLimitSummaryByCoreId = async (idCore: string, token: string): Promise<ProjectUploadLimitSummaryResponse> => {
  const project = await getProjectByCoreId(idCore)
  if (project === undefined) { throw BioNotFoundError() }

  const projectType: NonNullable<Project['projectType']> = project.projectType ?? 'free'
  const projectTypeLimitMap = await getProjectTypeLimitMap()
  const limits = projectTypeLimitMap[projectType]
  const legacyUsage = await getProjectTieringUsageLegacy(token, project.slug)
  const recordingMinutesCount = Number(legacyUsage.recordingMinutesCount ?? 0)
  const recordingMinutesLimit = limits.recordingMinutesCount

  return {
    idCore: project.idCore,
    slug: project.slug,
    projectType,
    isLocked: project.isLocked,
    recordingMinutesCount,
    recordingMinutesLimit,
    remainingRecordingMinutes: recordingMinutesLimit === null ? null : Math.max(0, recordingMinutesLimit - recordingMinutesCount)
  }
}
