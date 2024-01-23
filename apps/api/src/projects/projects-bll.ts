import QuickLRU from 'quick-lru'

import { type ProjectsGeoResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/common/dao/types'

import { query } from './dao/projects-dao'

export const getProjects = async (limit?: number, offset?: number): Promise<ProjectsResponse> => {
  return await query<Project>({}, { limit, offset })
}

const projectsGeoCache = new QuickLRU<string, ProjectsGeoResponse>({
  maxSize: 10,
  // 3 hour cache
  maxAge: 1000 * 60 * 60 * 3
})

export const getProjectsGeo = async (limit?: number, offset?: number): Promise<ProjectsGeoResponse> => {
  const key = JSON.stringify({ limit, offset })

  const cacheHit = projectsGeoCache.get(key)
  if (cacheHit !== undefined) {
    return cacheHit
  }

  const projects = await query<Project>({}, { limit, offset, attributesSet: 'geo' })
  projectsGeoCache.set(key, projects)
  return projects
}
