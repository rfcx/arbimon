import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject } from 'vue-property-decorator'

import { ApiProjectLight } from '@rfcx-bio/common/api-bio/common/projects'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Emit() emitCloseProjectSelector (): boolean { return false }

  newSelectedProject: ApiProjectLight | null = null

  get selectedProject (): ApiProjectLight | null {
    return this.store.selectedProject ?? null
  }

  override created (): void {
    this.newSelectedProject = this.selectedProject
      ? { ...this.selectedProject }
      : null
  }

  isSelectedProject (project: ApiProjectLight): boolean {
    return project.id === this.newSelectedProject?.id
  }

  setSelectedProject (project: ApiProjectLight): void {
    this.newSelectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    if (this.newSelectedProject) {
      await this.store.updateSelectedProject(this.newSelectedProject)
      await this.$router.push({ name: ROUTE_NAMES.dashboard, params: { projectSlug: this.newSelectedProject.slug } })
    }
    this.emitCloseProjectSelector()
  }
}
