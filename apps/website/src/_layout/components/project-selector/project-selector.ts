import { OnClickOutside } from '@vueuse/components'
import { slice } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject } from 'vue-property-decorator'
import { RouteParamsRaw } from 'vue-router'

import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'
import ProjectList from './project-list.vue'

const MAX_DISPLAY_ITEMS = 5

@Options({
  components: {
    OnClickOutside,
    ProjectList
  }
})
export default class ProjectSelectorComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Emit() emitCloseProjectSelector (): boolean { return false }

  newSelectedProject: LocationProjectForUser | null = null
  searchKeyword: string | null = null

  get selectedProject (): LocationProjectForUser | null {
    return this.store.selectedProject ?? null
  }

  get userProjects (): LocationProjectForUser[] {
    const allMyProjects = this.store.projects.filter(({ isMyProject }) => isMyProject)
    return this.filterProject(allMyProjects)
  }

  get publicProjects (): LocationProjectForUser[] {
    const allPublicProjects = this.store.projects.filter(({ isMyProject }) => !isMyProject)
    return this.filterProject(allPublicProjects)
  }

  override created (): void {
    this.newSelectedProject = this.selectedProject
      ? { ...this.selectedProject }
      : null
  }

  isSelectedProject (project: LocationProjectForUser): boolean {
    return project.id === this.newSelectedProject?.id
  }

  setSelectedProject (project: LocationProjectForUser): void {
    this.newSelectedProject = project
  }

  filterProject (projects: LocationProjectForUser[]): LocationProjectForUser[] {
    const keyword = this.searchKeyword
    if (keyword !== null && keyword.length > 0) {
      const filteredProjects = projects
        .filter(({ name }) => name.toLowerCase().includes(keyword.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
      return slice(filteredProjects, 0, MAX_DISPLAY_ITEMS)
    }
    const matchedProjectIdx = projects.findIndex(({ id }) => id === this.selectedProject?.id)
    if (this.selectedProject !== null && matchedProjectIdx !== -1) {
      const matchedProject = projects[matchedProjectIdx]
      projects.splice(matchedProjectIdx, 1)
      return slice([matchedProject, ...projects], 0, MAX_DISPLAY_ITEMS)
    }
    return slice(projects, 0, MAX_DISPLAY_ITEMS)
  }

  async confirmedSelectedProject (): Promise<void> {
    if (this.newSelectedProject) {
      await this.store.updateSelectedProject(this.newSelectedProject)
      const params: RouteParamsRaw = { projectSlug: this.newSelectedProject.slug }
      if (this.$route.name === ROUTE_NAMES.activityPatterns) {
        await this.$router.push({ params: { ...params, speciesSlug: undefined } })
      } else {
        await this.$router.push({ params })
      }
    }
    this.emitCloseProjectSelector()
  }
}
