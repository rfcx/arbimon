import { Options, Vue } from 'vue-class-component'

import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import NavBarComponent from '@/components/navbar/navbar.vue'
import { Auth0Option, Auth0User, ProjectModels } from '@/models'
import { VXServices } from '@/services'

@Options({
  components: { NavBarComponent, InvalidProjectComponent }
})
export default class RootPage extends Vue {
  @VXServices.Auth.auth.VX()
  protected auth!: Auth0Option | undefined

  @VXServices.Auth.user.VX()
  protected user!: Auth0User | undefined

  @VXServices.Project.selectedProject.VX()
  selectedProject!: ProjectModels.ProjectListItem | undefined
}
