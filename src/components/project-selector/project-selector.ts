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
  projects!: ProjectModels.Project[]

  @VXServices.Project.selectedProject.VX()
  selectedProject!: ProjectModels.Project | undefined

  public currentSelectedProject: ProjectModels.Project | undefined = VXServices.Project.selectedProject.get()

  isSelectedProject (project: ProjectModels.Project): boolean {
    return project.id === this.currentSelectedProject?.id
  }

  setSelectedProject (project: ProjectModels.Project): void {
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
