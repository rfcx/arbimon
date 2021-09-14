import { Vue } from 'vue-class-component'

import { ProjectModels } from '@/models'
import { VXServices } from '@/services'

export default class ProjectSelectorComponent extends Vue {
  @VXServices.Project.list.VX()
  projects!: ProjectModels.Project[]

  @VXServices.Project.selectedProject.VX()
  selectedProject!: ProjectModels.Project | undefined

  currentSelectedProject: ProjectModels.Project | undefined = VXServices.Project.selectedProject.get()

  isSelectedProject (project: ProjectModels.Project): boolean {
    return project.id === this.currentSelectedProject?.id
  }

  setSelectedProject (project: ProjectModels.Project): void {
    this.currentSelectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    await VXServices.Project.selectedProject.set(this.currentSelectedProject)
  }
}
