import { Options, Vue } from 'vue-class-component'
import { useRoute } from 'vue-router'

import { ROUTES_NAME } from '@/router'
import ProjectSelectorComponent from '../project-selector/project-selector.vue'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

@Options({
  components: {
    'project-selector': ProjectSelectorComponent
  }
})

export default class NavigationBarComponent extends Vue {
  private readonly projectId: string = useRoute().params.projectId as string ?? ''

  public get navMenus (): NavMenus[] {
    if (this.projectId === '') return []
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

  public get arbimonLink (): string {
    if (this.projectId === '') return ''
    else { return `https://arbimon.rfcx.org/project/${this.projectId}` }
  }

  public async login (): Promise<void> {
    await Promise.resolve()
  }

  public async logout (): Promise<void> {
    await Promise.resolve()
  }
}
