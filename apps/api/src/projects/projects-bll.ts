import QuickLRU from 'quick-lru'

import { type ProjectUploadLimitSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-upload-limit-summary'
import { type LocationProjectWithRole, type ProjectsGeoResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { type ProjectEntitlementSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-entitlement-summary'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getProjectTieringUsageLegacy } from '~/api-legacy-arbimon'
import { BioNotFoundError } from '~/errors'
import { getUserRoleForProject } from './dao/project-member-dao'
import { getProjectTieringUsage } from './dao/project-tiering-usage-dao'
import { getProjectByCoreId, getProjectBySlug, query } from './dao/projects-dao'
import { getProjectTypeLimitMap } from '../tiering/tier-limit-bll'

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

export const getProjectBySlugForUser = async (slug: string, userId: number | undefined): Promise<LocationProjectWithRole> => {
  const project = await getProjectBySlug(slug)
  if (project === undefined) { throw BioNotFoundError() }

  const role = await getUserRoleForProject(userId, project.id)
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
    entitlementState: project.entitlementState,
    viewOnlyEffective: project.viewOnlyEffective,
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
    entitlementState: project.entitlementState,
    viewOnlyEffective: project.viewOnlyEffective,
    recordingMinutesCount,
    recordingMinutesLimit,
    remainingRecordingMinutes: recordingMinutesLimit === null ? null : Math.max(0, recordingMinutesLimit - recordingMinutesCount)
  }
}
