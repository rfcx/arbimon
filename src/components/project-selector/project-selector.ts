import { Vue } from 'vue-class-component'

import { ProjectModels } from '@/models'
import { VXServices } from '@/services'

export default class ProjectSelectorComponent extends Vue {
  @VXServices.Project.list.VX()
  projects!: ProjectModels.Project[]

  @VXServices.Project.selectedProject.VX()
  selectedProject!: ProjectModels.Project | undefined

  isSelectedProject (project: ProjectModels.Project): boolean {
    return project.id === this.selectedProject?.id
  }
}
