import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ProjectLight, ProjectProfileWithMetrics } from '@/projects/project-directory/data/types'

export const useProjectDirectoryStore = defineStore('project-directory-store', () => {
  const allProjects = ref<ProjectLight[]>([])
  const updateAllProjects = (projects: ProjectLight[]): void => {
    allProjects.value = projects
  }
  const allProjectsWithMetrics = ref<ProjectProfileWithMetrics[]>([])
  const updateAllProjectsWithMetrics = (projects: ProjectProfileWithMetrics[]): void => {
    allProjectsWithMetrics.value = projects
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
    updateAllProjectsWithMetrics,
    getProjectWithMetricsById,
    getProjectWithMetricsByIds
  }
})
