import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { Project, Site } from '~/api'
import { getProjects } from '~/api/project-service'
import { getSites } from '~/api/site-service'

// Designed for contrast & color-blind support:
const DEFAULT_DATASET_COLORS = ['#85EBBA', '#6FC1F5', '#B578DB', '#EAC3E4', '#D6E68C']
const FAKE_PROJECT = { id: '123', name: 'Puerto Rico', isPublic: true, externalId: 123456 }

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: DEFAULT_DATASET_COLORS,
    projects: [] as Project[],
    selectedProject: undefined as Project | undefined,
    sites: [] as Site[]
  }),
  getters: {},
  actions: {
    async updateUser (user: User | undefined = undefined) {
      // Set user immediately (& clear old data)
      this.user = user
      this.projects = []
      this.selectedProject = undefined
      this.sites = []

      // Load data asynchronously
      if (user) {
        // TODO 17 - Make this conditional on build mode (dev, staging, prod)
        // TODO 65 - Replace this with a mock service
        const projects = [...await getProjects(), FAKE_PROJECT]
        const selectedProject = projects.length > 0 ? projects[0] : undefined
        const sites = selectedProject ? await getSites(selectedProject) : []

        this.projects = projects
        this.selectedProject = selectedProject
        this.sites = sites
      }
    },
    updateSelectedProject (project?: Project) { this.selectedProject = project }
  }
})

export type BiodiversityStore = ReturnType<typeof useStore>
export const pinia = createPinia()
export const useStoreOutsideSetup = (): BiodiversityStore => useStore(pinia)
