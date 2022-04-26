import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'
import { computed, ComputedRef } from 'vue'
import { useQuery } from 'vue-query'

import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'
import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

import { projectService } from '~/api/project-service'
import { Loadable, queryAsLoadable } from '~/loadable'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'

const ONE_HOUR_IN_MILLIS = 3_600_000 // 60 * 60 * 1000

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
    projectData: (state): ComputedRef<Loadable<ProjectFiltersResponse, unknown>> => {
      const projectId = computed(() => state.selectedProject?.id)

      return queryAsLoadable(
        useQuery(['fetch-project-filter', projectId], async () => {
          if (projectId.value === undefined) return undefined

          return await projectService.getProjectFilters(projectId.value)
        }, {
          staleTime: ONE_HOUR_IN_MILLIS
        }),
        (d: ProjectFiltersResponse | undefined): d is ProjectFiltersResponse => d !== undefined
      )
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
