import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'
import { computed } from 'vue'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'
import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

import { projectService } from '~/api/project-service'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
    projects: [] as LocationProjectForUser[],
    selectedProject: undefined as LocationProjectForUser | undefined,
    projectFilters: undefined as ProjectFiltersResponse | undefined,
    currentVersion: ''
  }),
  getters: {
    projectData: (state): UseQueryReturnType<ProjectFiltersResponse | undefined, unknown> => {
      const projectId = computed(() => state.selectedProject?.id)
      return useQuery(['fetch-project-filter', projectId], async () => {
        if (projectId.value === undefined) return undefined

        return await projectService.getProjectFilters(projectId.value)
      })
    }
  },
  actions: {
    async updateUser (user: User | undefined = undefined) {
      // Set user & clear old data immediately
      this.user = user
      await this.updateProjects([])

      // Load new data asynchronously
      const projects = await projectService.getProjects() ?? []
      await this.updateProjects(projects)
    },
    async updateProjects (projects: LocationProjectForUser[]) {
      this.projects = projects
      await this.updateSelectedProject(projects?.[0])
    },
    async updateSelectedProject (project?: LocationProjectForUser) {
      if (this.selectedProject?.id === project?.id) return

      // Set project & clear old data immediately
      this.selectedProject = project
    },
    async setCurrentVersion (version: string) {
      this.currentVersion = version
    }
  }
})

export type BiodiversityStore = ReturnType<typeof useStore>
export const pinia = createPinia()
export const useStoreOutsideSetup = (): BiodiversityStore => useStore(pinia)
