import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { ProjectModels } from '@/models'
import { ROUTES_NAME } from '@/router'
import { VuexService } from '@/services'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @VuexService.Project.projects.bind()
  projects!: ProjectModels.ProjectListItem[]

  @VuexService.Project.selectedProject.bind()
  selectedProject!: ProjectModels.ProjectListItem | undefined

  public currentSelectedProject: ProjectModels.ProjectListItem | undefined = { ...VuexService.Project.selectedProject.get() }

  isSelectedProject (project: ProjectModels.ProjectListItem): boolean {
    return project.id === this.currentSelectedProject?.id
  }

  setSelectedProject (project: ProjectModels.ProjectListItem): void {
    this.currentSelectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    await VuexService.Project.selectedProject.set(this.currentSelectedProject)
    this.closeProjectSelector()

    const newProjectId = this.currentSelectedProject?.id
    if (newProjectId !== undefined) void this.$router.push({ name: ROUTES_NAME.overview, params: { projectId: newProjectId } })
  }

  @Emit('closeProjectSelector')
  public closeProjectSelector (): boolean {
    return false
  }
}
