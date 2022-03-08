import { User } from '@auth0/auth0-spa-js'
import { createPinia, defineStore } from 'pinia'

import { LocationProjectLight, Site } from '@rfcx-bio/common/dao/types'

import { projectService } from '~/api/project-service'
import { COLORS_BIO_INCLUSIVE } from '~/store/colors'

export const useStore = defineStore('root', {
  state: () => ({
    user: undefined as User | undefined,
    datasetColors: COLORS_BIO_INCLUSIVE,
    projects: [] as LocationProjectLight[],
    selectedProject: undefined as LocationProjectLight | undefined,
    sites: [] as Site[]
  }),
  getters: {},
  actions: {
    async updateUser (user: User | undefined = undefined) {
      // Set user & clear old data immediately
      this.user = user
      await this.updateProjects([])

      // Load new data asynchronously
      const projects = await projectService.getProjects() ?? []
      await this.updateProjects(projects)
    },
    async updateProjects (projects: LocationProjectLight[]) {
      this.projects = projects
      await this.updateSelectedProject(projects?.[0])
    },
    async updateSelectedProject (project?: LocationProjectLight) {
      if (this.selectedProject?.id === project?.id) return

      this.selectedProject = project
      this.sites = project ? await projectService.getSites(project.id) ?? [] : []
    }
  }
})

export type BiodiversityStore = ReturnType<typeof useStore>
export const pinia = createPinia()
export const useStoreOutsideSetup = (): BiodiversityStore => useStore(pinia)
