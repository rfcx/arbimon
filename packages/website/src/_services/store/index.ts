import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { Project, Site } from '~/api'
import { getProjects } from '~/api/project-service'
import { getSites } from '~/api/site-service'

// Designed for contrast & color-blind support:
const DEFAULT_DATASET_COLORS = ['#85EBBA', '#6FC1F5', '#B578DB', '#EAC3E4', '#D6E68C']
const FAKE_PUERTO_RICO_PROJECT = { id: 'puerto-rico-island-wide', name: 'Puerto Rico Island-Wide', isPublic: true, externalId: 123456 }

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
        const realProjects = await getProjects()
        const [realPuertoRicoProject] = realProjects.splice(realProjects.findIndex(p => p.id === 'puerto-rico-island-wide'))
        const projects = [realPuertoRicoProject ?? FAKE_PUERTO_RICO_PROJECT, ...realProjects]

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
