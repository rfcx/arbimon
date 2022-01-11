import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { Project } from '@rfcx-bio/common/api-bio/common/projects'
import { Site } from '@rfcx-bio/common/api-bio/common/sites'

import { getSites } from '~/api/site-service'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'

const FAKE_PUERTO_RICO_PROJECT: Project = {
  id: import.meta.env.VITE_PUERTO_RICO_PROJECT_SLUG,
  name: 'Puerto Rico Island-Wide',
  isPublic: true,
  externalId: 123456,
  geoBounds: [
    { lon: -65.24505, lat: 18.51375 },
    { lon: -67.94469784, lat: 17.93168 }
  ]
}

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
      // Set user & clear old data immediately
      this.user = user
      this.projects = []
      await this.updateSelectedProject(undefined)

      // Load new data asynchronously
      if (user) {
        const projects = [FAKE_PUERTO_RICO_PROJECT] // await getProjects()
        this.projects = projects
        await this.updateSelectedProject(projects[0])
      }
    },
    async updateSelectedProject (project?: Project) {
      this.selectedProject = project
      const sites = project ? await getSites(project) : []
      this.sites = sites
    }
  }
})

export type BiodiversityStore = ReturnType<typeof useStore>
export const pinia = createPinia()
export const useStoreOutsideSetup = (): BiodiversityStore => useStore(pinia)
