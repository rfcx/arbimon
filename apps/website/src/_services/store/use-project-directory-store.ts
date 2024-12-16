import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ProjectLight, ProjectProfileWithMetrics } from '@rfcx-bio/common/api-bio/project/projects'

export const useProjectDirectoryStore = defineStore('project-directory-store', () => {
  const allProjects = ref<ProjectLight[]>([])
  const updateAllProjects = (projects: ProjectLight[]): void => {
    allProjects.value = projects
  }
  const allProjectsWithMetrics = ref<ProjectProfileWithMetrics[]>([])
  const allProjectsWithMetricsOffset = ref<number>(0)
  const addProjectsWithMetrics = (projects: ProjectProfileWithMetrics[]): void => {
    if (allProjectsWithMetrics.value.length === 0) { // if empty, just add
      allProjectsWithMetrics.value = projects
      allProjectsWithMetricsOffset.value = allProjectsWithMetrics.value.length
      return
    }

    projects.forEach(p => {
      const index = allProjectsWithMetrics.value.findIndex(ap => ap.id === p.id)
      allProjectsWithMetricsOffset.value++
      if (index === -1) {
        allProjectsWithMetrics.value.push(p)
      } else {
        allProjectsWithMetrics.value[index] = p
      }
    })
  }
  const resetAllProjectsWithMetrics = (): void => {
    allProjectsWithMetrics.value = []
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
    allProjectsWithMetricsOffset,
    resetAllProjectsWithMetrics,
    addProjectsWithMetrics,
    getProjectLightById,
    getProjectWithMetricsById,
    getProjectWithMetricsByIds
  }
})
