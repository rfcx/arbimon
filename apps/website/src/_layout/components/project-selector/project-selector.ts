import { OnClickOutside } from '@vueuse/components'
import { slice } from 'lodash-es'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject } from 'vue-property-decorator'
import { RouteParamsRaw } from 'vue-router'

import { ProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

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

  newSelectedProject: ProjectForUser | null = null
  searchKeyword: string | null = null

  get selectedProject (): ProjectForUser | null {
    return this.store.selectedProject ?? null
  }

  get userProjects (): ProjectForUser[] {
    const allMyProjects = this.store.projects.filter(({ isMyProject }) => isMyProject)
    return this.filterProject(allMyProjects)
  }

  get publicProjects (): ProjectForUser[] {
    const allPublicProjects = this.store.projects.filter(({ isMyProject }) => !isMyProject)
    return this.filterProject(allPublicProjects)
  }

  override created (): void {
    this.newSelectedProject = this.selectedProject
      ? { ...this.selectedProject }
      : null
  }

  isSelectedProject (project: ProjectForUser): boolean {
    return project.id === this.newSelectedProject?.id
  }

  setSelectedProject (project: ProjectForUser): void {
    this.newSelectedProject = project
  }

  filterProject (projects: ProjectForUser[]): ProjectForUser[] {
    const keyword = this.searchKeyword
    if (keyword !== null && keyword.length > 0) {
      const filteredProjects = projects
        .filter(({ name }) => name.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(keyword)))
        .sort((a, b) => a.name.localeCompare(b.name))
      return slice(filteredProjects, 0, MAX_DISPLAY_ITEMS)
    }
    return projects
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
