import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'
import { computed, ComputedRef } from 'vue'

import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'
import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

import { projectService } from '~/api/project-service'
import { Loadable, queryAsLoadable, useApiQuery } from '~/loadable'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'

const ONE_HOUR_IN_MILLIS = 3_600_000 // 60 * 60 * 1000

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
    projects: [] as LocationProjectForUser[],
    selectedProjectSlug: '',
    currentVersion: ''
  }),
  getters: {
    projectData (): ComputedRef<Loadable<ProjectFiltersResponse, unknown>> {
      const projectId = computed(() => this.selectedProject?.id)

      return queryAsLoadable(
        useApiQuery(['fetch-project-filter', projectId], async () => {
          if (projectId.value === undefined) return undefined

          return await projectService.getProjectFilters(projectId.value)
        }, {
          staleTime: ONE_HOUR_IN_MILLIS
        }),
        (d: ProjectFiltersResponse | undefined): d is ProjectFiltersResponse => d !== undefined
      )
    },
    selectedProject: (state): LocationProjectForUser | undefined => {
      if (state.projects.length === 0) return undefined
      return state.projects.find(({ slug }) => slug === state.selectedProjectSlug)
    }
  },
  actions: {
    async updateUser (user: User | undefined = undefined) {
      this.user = user

      const projects = await projectService.getProjects() ?? []
      this.projects = projects
      await this.updateSelectedProjectSlug(projects?.[0].slug ?? '')
    },
    async updateSelectedProjectSlug (projectSlug: string) {
      this.selectedProjectSlug = projectSlug
    },
    async setCurrentVersion (version: string) {
      this.currentVersion = version
    }
  }
})

export type BiodiversityStore = ReturnType<typeof useStore>
export const pinia = createPinia()
export const useStoreOutsideSetup = (): BiodiversityStore => useStore(pinia)
