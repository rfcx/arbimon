import { type User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { type ProjectFiltersResponse, apiBioGetProjectFilters } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type LocationProjectWithInfo, type LocationProjectWithRole, apiBioGetProjectBySlug } from '@rfcx-bio/common/api-bio/project/projects'
import { rolesGreaterOrEqualTo } from '@rfcx-bio/common/roles'
import { getApiClient } from '@rfcx-bio/utils/api'

import { getIdToken, useAuth0Client } from '~/auth-client'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'
import { useDashboardStore } from './use-dashboard-store'
import { useDetectionsResultFilterBySpeciesStore } from './use-detections-result-filter-by-species-store'
import { useDetectionsResultFilterStore } from './use-detections-result-filter-store'
import { useHighlightedSpeciesStore } from './use-highlighted-species-store'
import { useProjectDirectoryStore } from './use-project-directory-store'
import { useSuperStore } from './use-super-admin-store'

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
    myProjects: [] as LocationProjectWithInfo[],
    project: undefined as LocationProjectWithRole | undefined,
    projectFilters: undefined as ProjectFiltersResponse | undefined,
    currentVersion: ''
  }),
  getters: {
    userIsExternalGuest: (state) => state.project?.role === 'external',
    userIsGuest: (state) => state.project?.role === 'viewer' || state.project?.role === 'external',
    userIsProjectMember: (state) => rolesGreaterOrEqualTo('viewer').includes(state.project?.role ?? 'none'),
    userIsDataEntryMember: (state) => rolesGreaterOrEqualTo('entry').includes(state.project?.role ?? 'none'),
    userIsFullProjectMember: (state) => rolesGreaterOrEqualTo('user').includes(state.project?.role ?? 'none'),
    userIsAdminProjectMember: (state) => rolesGreaterOrEqualTo('admin').includes(state.project?.role ?? 'none'),
    userIsExpertMember: (state) => rolesGreaterOrEqualTo('expert').includes(state.project?.role ?? 'none'),
  },
  actions: {
    async updateUser (user: User | undefined = undefined) {
      this.user = user
    },
    updateMyProject (projects?: LocationProjectWithInfo[]) {
      projects?.forEach(p => {
        const index = this.myProjects.findIndex(mp => mp.idCore === p.idCore)
        if (index === -1) {
          this.myProjects.push(p)
        } else {
          this.myProjects[index] = p // update the changes to existing objects
        }
      })
    },
    deleteProject (projectId?: number) {
      this.myProjects = this.myProjects.filter(p => p.id !== projectId)
    },
    async updateSelectedProjectSlug (slug: string) {
      // Temporary hack to get an API Client (this will be extracted in the loading branch)
      const authClient = await useAuth0Client()
      const apiClient = getApiClient(import.meta.env.VITE_API_BASE_URL, this.user ? async () => await getIdToken(authClient) : undefined)
      this.project = await apiBioGetProjectBySlug(apiClient, slug)
    },
    updateSelectedProject (project?: LocationProjectWithRole) {
      if (this.project?.id === project?.id) return

      // Set project & clear old data immediately
      this.project = project
      this.projectFilters = undefined
    },
    updateProjectSlug (slug: string) {
      if (this.project == null) return
      this.project.slug = slug
    },
    updateProjectName (name: string) {
      if (this.project == null) return
      this.project.name = name
    },
    async updateProjectFilters () {
      if (this.project == null) {
        this.projectFilters = undefined
        return
      }

      // Temporary hack to get an API Client (this will be extracted in the loading branch)
      const authClient = await useAuth0Client()
      const apiClientBio = getApiClient(import.meta.env.VITE_API_BASE_URL, this.user ? async () => await getIdToken(authClient) : undefined)

      this.projectFilters = await apiBioGetProjectFilters(apiClientBio, this.project.id)
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
  useDetectionsResultFilterStore,
  useHighlightedSpeciesStore,
  useProjectDirectoryStore,
  useSuperStore
}
