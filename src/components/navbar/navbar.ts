import { Options, Vue } from 'vue-class-component'
import { useRoute } from 'vue-router'

import { Auth0Option, Auth0User } from '@/models'
import { NavMenu } from '@/models/Navbar'
import { ROUTES_NAME } from '@/router'
import { VXServices } from '@/services'
import ProjectSelectorComponent from '../project-selector/project-selector.vue'

@Options({
  components: {
    'project-selector': ProjectSelectorComponent
  }
})

export default class NavigationBarComponent extends Vue {
  private readonly projectId: string = useRoute().params.projectId as string ?? ''

  @VXServices.Auth.auth.VX()
  public auth!: Auth0Option | undefined

  @VXServices.Auth.user.VX()
  public user!: Auth0User | undefined

  public get navMenus (): NavMenu[] {
    if (this.projectId === '') return []
    return [
      {
        label: 'Overview',
        destination: ROUTES_NAME.overview
      },
      {
        label: 'Species Richness',
        destination: ROUTES_NAME.species_richness
      }
    ]
  }

  public get arbimonLink (): string {
    if (this.projectId === '') return ''
    else { return `https://arbimon.rfcx.org/project/${this.projectId}` }
  }

  public get userImage (): string {
    return this.user?.picture ?? ''
  }

  public async login (): Promise<void> {
    await this.auth?.loginWithRedirect()
  }

  public async logout (): Promise<void> {
    await this.auth?.logout({ returnTo: window.location.origin })
  }
}
