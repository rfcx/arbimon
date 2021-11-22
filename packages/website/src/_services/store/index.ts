import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { Project, Site } from '~/api'
import { getProjects } from '~/api/project-service'
import { getSites } from '~/api/site-service'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'

const FAKE_PUERTO_RICO_PROJECT = { id: 'puerto-rico-island-wide', name: 'Puerto Rico Island-Wide', isPublic: true, externalId: 123456 }

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
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
        const projects = [FAKE_PUERTO_RICO_PROJECT, ...realProjects]
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
