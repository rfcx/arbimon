import { type User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { type ProjectFiltersResponse, apiBioGetProjectFilters } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type LocationProjectForUser, type LocationProjectWithInfo, apiBioGetMyProjects, apiBioGetProjects } from '@rfcx-bio/common/api-bio/project/projects'
import { getApiClient } from '@rfcx-bio/utils/api'

import { getIdToken, useAuth0Client } from '~/auth-client'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'
import { useDashboardStore } from './use-dashboard-store'
import { useDetectionsResultFilterBySpeciesStore } from './use-detections-result-filter-by-species-store'
import { useDetectionsResultFilterStore } from './use-detections-result-filter-store'

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
    projects: [] as LocationProjectForUser[],
    myProjects: [] as LocationProjectWithInfo[],
    selectedProject: undefined as LocationProjectForUser | undefined,
    projectFilters: undefined as ProjectFiltersResponse | undefined,
    currentVersion: ''
  }),
  getters: {},
  actions: {
    async updateUser (user: User | undefined = undefined) {
      this.user = user
      await this.refreshProjects()
      const selectedProject = this.selectedProject ?? this.projects?.[0]
      this.updateSelectedProject(selectedProject)
    },
    async refreshProjects () {
      // Temporary hack to get an API Client (this will be extracted in the loading branch)
      await this.refreshMyProjects()
      const authClient = await useAuth0Client()
      const apiClient = getApiClient(import.meta.env.VITE_API_BASE_URL, this.user ? async () => await getIdToken(authClient) : undefined)
      this.projects = await apiBioGetProjects(apiClient) ?? []
    },
    async refreshMyProjects () {
      // Temporary hack to get an API Client (this will be extracted in the loading branch)
      const authClient = await useAuth0Client()
      const apiClient = getApiClient(import.meta.env.VITE_API_BASE_URL, this.user ? async () => await getIdToken(authClient) : undefined)
      this.myProjects = (await apiBioGetMyProjects(apiClient))?.data ?? []
    },
    updateSelectedProject (project?: LocationProjectForUser) {
      if (this.selectedProject?.id === project?.id) return

      // Set project & clear old data immediately
      this.selectedProject = project
      this.projectFilters = undefined
    },
    updateProjectName (name: string) {
      if (this.selectedProject == null) return
      this.selectedProject.name = name
    },
    async updateProjectFilters () {
      if (this.selectedProject == null) {
        this.projectFilters = undefined
        return
      }

      // Temporary hack to get an API Client (this will be extracted in the loading branch)
      const authClient = await useAuth0Client()
      const apiClientBio = getApiClient(import.meta.env.VITE_API_BASE_URL, this.user ? async () => await getIdToken(authClient) : undefined)

      this.projectFilters = await apiBioGetProjectFilters(apiClientBio, this.selectedProject.id)
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
  useDashboardStore,
  useDetectionsResultFilterBySpeciesStore,
  useDetectionsResultFilterStore
}
