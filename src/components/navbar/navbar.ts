import { Vue } from 'vue-class-component'
import { useRoute } from 'vue-router'

import { ROUTES_NAME } from '@/router'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

export default class NavigationBarComponent extends Vue {
  private readonly route = useRoute()
  private readonly projectId = this.route.params.projectId

  mounted (): void {
    console.log('navbar selected project', this.projectId)
  }

  public get navMenus (): NavMenus[] {
    if (this.projectId === undefined) return [] // hide menu
    return [
      {
        label: 'Overview',
        routerPath: ROUTES_NAME.overview
      },
      {
        label: 'Species Richness',
        routerPath: ROUTES_NAME.species_richness
      }
    ]
  }

  public get arbimonLink (): String {
    return 'https://arbimon.rfcx.org' // TODO: add project id
  }

  public async login (): Promise<void> {
    await Promise.resolve()
  }

  public async logout (): Promise<void> {
    await Promise.resolve()
  }
}
