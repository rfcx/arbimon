import QuickLRU from 'quick-lru'

import { type LocationProjectWithRole, type ProjectsGeoResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { BioNotFoundError } from '~/errors'
import { getUserRoleForProject } from './dao/project-member-dao'
import { getProjectBySlug, query } from './dao/projects-dao'

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

  return { ...project, role }
}
