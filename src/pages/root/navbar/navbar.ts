import { Vue } from 'vue-class-component'

import { ROUTES_NAME } from '@/router'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

export default class NavigationBarComponent extends Vue {
  public get navMenus (): NavMenus[] {
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

  public async login (): Promise<void> {
    await Promise.resolve()
  }

  public async logout (): Promise<void> {
    await Promise.resolve()
  }
}
