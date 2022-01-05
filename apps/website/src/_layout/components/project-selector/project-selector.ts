import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject } from 'vue-property-decorator'

import { Project } from '@rfcx-bio/common/api-bio/common/projects'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Emit() emitCloseProjectSelector (): boolean { return false }

  newSelectedProject: Project | null = null

  override created (): void {
    this.newSelectedProject = this.store.selectedProject
      ? { ...this.store.selectedProject }
      : null
  }

  isSelectedProject (project: Project): boolean {
    return project.id === this.newSelectedProject?.id
  }

  setSelectedProject (project: Project): void {
    this.newSelectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    if (this.newSelectedProject) {
      this.store.updateSelectedProject(this.newSelectedProject)
      void this.$router.push({ name: ROUTE_NAMES.dashboard, params: { projectId: this.newSelectedProject.id } })
    }
    this.emitCloseProjectSelector()
  }
}
