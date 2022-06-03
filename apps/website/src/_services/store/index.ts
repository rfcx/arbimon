import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

import { projectService } from '~/api/project-service'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
    projects: [] as LocationProjectForUser[],
    selectedProjectSlug: '',
    currentVersion: ''
  }),
  getters: {
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
