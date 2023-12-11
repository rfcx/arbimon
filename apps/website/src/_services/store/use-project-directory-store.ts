import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ProjectLight, ProjectProfileWithMetrics } from '@rfcx-bio/common/api-bio/project/projects'

export const useProjectDirectoryStore = defineStore('project-directory-store', () => {
  const allProjects = ref<ProjectLight[]>([])
  const updateAllProjects = (projects: ProjectLight[]): void => {
    allProjects.value = projects
  }
  const allProjectsWithMetrics = ref<ProjectProfileWithMetrics[]>([])
  const addProjectsWithMetrics = (projects: ProjectProfileWithMetrics[]): void => {
    if (allProjectsWithMetrics.value.length === 0) { // if empty, just add
      allProjectsWithMetrics.value = projects
      return
    }

    projects.forEach(p => {
      const index = allProjectsWithMetrics.value.findIndex(ap => ap.id === p.id)
      if (index === -1) {
        allProjectsWithMetrics.value.push(p)
      } else {
        allProjectsWithMetrics.value[index] = p
      }
    })
  }
  const getProjectLightById = (id: number): ProjectLight | undefined => {
    return allProjects.value.find(p => p.id === id)
  }
  const getProjectWithMetricsById = (id: number): ProjectProfileWithMetrics | undefined => {
    return allProjectsWithMetrics.value.find(p => p.id === id)
  }
  const getProjectWithMetricsByIds = (ids: number[]): ProjectProfileWithMetrics[] => {
    return allProjectsWithMetrics.value.filter(p => ids.includes(p.id))
  }
  return {
    allProjects,
    updateAllProjects,
    allProjectsWithMetrics,
    addProjectsWithMetrics,
    getProjectLightById,
    getProjectWithMetricsById,
    getProjectWithMetricsByIds
  }
})
