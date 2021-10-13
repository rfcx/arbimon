import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { Project } from '@/_services/api'
import { ROUTE_NAMES } from '@/_services/router'
import { VuexProject } from '@/_services/store'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @Emit()
  emitCloseProjectSelector (): boolean {
    return false
  }

  @VuexProject.projects.bind() projects!: Project[]
  @VuexProject.selectedProject.bind() selectedProject!: Project | undefined

  currentSelectedProject: Project | undefined = { ...VuexProject.selectedProject.get() }

  isSelectedProject (project: Project): boolean {
    return project.id === this.currentSelectedProject?.id
  }

  setSelectedProject (project: Project): void {
    this.currentSelectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    await VuexProject.selectedProject.set(this.currentSelectedProject)
    this.emitCloseProjectSelector()

    const newProjectId = this.currentSelectedProject?.id
    if (newProjectId !== undefined) void this.$router.push({ name: ROUTE_NAMES.overview, params: { projectId: newProjectId } })
  }
}
