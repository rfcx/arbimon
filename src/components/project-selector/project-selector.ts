import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { ProjectModels } from '@/models'
import { ROUTES_NAME } from '@/router'
import { VXServices } from '@/services'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @VXServices.Project.list.VX()
  projects!: ProjectModels.ProjectListItem[]

  @VXServices.Project.selectedProject.VX()
  selectedProject!: ProjectModels.ProjectListItem | undefined

  public currentSelectedProject: ProjectModels.ProjectListItem | undefined = VXServices.Project.selectedProject.get()

  isSelectedProject (project: ProjectModels.ProjectListItem): boolean {
    return project.id === this.currentSelectedProject?.id
  }

  setSelectedProject (project: ProjectModels.ProjectListItem): void {
    this.currentSelectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    await VXServices.Project.selectedProject.set(this.currentSelectedProject)
    this.closeProjectSelector()
    void this.$router.push({
      name: ROUTES_NAME.overview,
      params: {
        projectId: this.currentSelectedProject?.id ?? ''
      }
    })
  }

  @Emit('closeProjectSelector')
  public closeProjectSelector (): boolean {
    return false
  }
}
