import { Options, Vue } from 'vue-class-component'

import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import NavBarComponent from '@/components/navbar/navbar.vue'
import { Auth0Option, Auth0User, ProjectModels } from '@/models'
import { VuexService } from '@/services'

@Options({
  components: { NavBarComponent, InvalidProjectComponent }
})
export default class RootPage extends Vue {
  @VuexService.Auth.auth.bind()
  protected auth!: Auth0Option | undefined

  @VuexService.Auth.user.bind()
  protected user!: Auth0User | undefined

  @VuexService.Project.selectedProject.bind()
  selectedProject!: ProjectModels.ProjectListItem | undefined
}
