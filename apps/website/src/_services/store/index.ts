import { type User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { type ProjectFiltersResponse, apiBioGetProjectFilters } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type LocationProjectForUser, apiBioGetProjects } from '@rfcx-bio/common/api-bio/project/projects'
import { getApiClient } from '@rfcx-bio/utils/api'

import { getIdToken, useAuth0Client } from '~/auth-client'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'
import { useCnnResultFilterStore } from './use-cnn-result-filter-store'

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
    projects: [] as LocationProjectForUser[],
    selectedProject: undefined as LocationProjectForUser | undefined,
    projectFilters: undefined as ProjectFiltersResponse | undefined,
    currentVersion: ''
  }),
  getters: {},
  actions: {
    async updateUser (user: User | undefined = undefined) {
      // Set user
      this.user = user

      // Temporary hack to get an API Client (this will be extracted in the loading branch)
      const authClient = await useAuth0Client()
      const apiClient = getApiClient(import.meta.env.VITE_BIO_API_BASE_URL, user ? async () => await getIdToken(authClient) : undefined)

      // Load new data
      const projects = await apiBioGetProjects(apiClient) ?? []
      await this.updateProjects(projects)
    },
    async updateProjects (projects: LocationProjectForUser[]) {
      this.projects = projects
      this.updateSelectedProject(projects?.[0])
    },
    updateSelectedProject (project?: LocationProjectForUser) {
      if (this.selectedProject?.id === project?.id) return

      // Set project & clear old data immediately
      this.selectedProject = project
      this.projectFilters = undefined
    },
    async updateProjectFilters () {
      if (this.selectedProject == null) {
        this.projectFilters = undefined
        return
      }

      // Temporary hack to get an API Client (this will be extracted in the loading branch)
      const authClient = await useAuth0Client()
      const apiClientBio = getApiClient(import.meta.env.VITE_BIO_API_BASE_URL, this.user ? async () => await getIdToken(authClient) : undefined)

      await apiBioGetProjectFilters(apiClientBio, this.selectedProject.id)
    },
    async setCurrentVersion (version: string) {
      this.currentVersion = version
    }
  }
})

export type BiodiversityStore = ReturnType<typeof useStore>
export const pinia = createPinia()
export const useStoreOutsideSetup = (): BiodiversityStore => useStore(pinia)

export {
  useCnnResultFilterStore
}
