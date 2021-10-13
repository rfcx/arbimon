import { Options, Vue } from 'vue-class-component'

import { Project } from '~/api'
import { Auth0Option, Auth0User } from '~/auth/types'
import { VuexAuth, VuexProject } from '~/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import NavbarComponent from '../components/navbar/navbar.vue'

@Options({
  components: { NavbarComponent, InvalidProjectComponent }
})
export default class ProjectRoot extends Vue {
  @VuexAuth.auth.bind() auth!: Auth0Option | undefined
  @VuexAuth.user.bind() user!: Auth0User | undefined
  @VuexProject.selectedProject.bind() selectedProject!: Project | undefined
}
