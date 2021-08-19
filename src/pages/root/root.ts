import { Vue } from 'vue-class-component'

import { ROUTES_PATH } from '@/router'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

export default class RootPage extends Vue {
  public get navMenus (): NavMenus[] {
    return [
      {
        label: 'Overview',
        routerPath: ROUTES_PATH.overview
      },
      {
        label: 'Species Richness',
        routerPath: ROUTES_PATH.species_richness
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
