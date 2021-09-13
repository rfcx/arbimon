import { Options, Vue } from 'vue-class-component'
import { useRoute } from 'vue-router'

import { NavMenu } from '@/models/Navbar'
import { ROUTES_NAME } from '@/router'
import ProjectSelectorComponent from '../project-selector/project-selector.vue'
import AuthNavbarItemComponent from './auth-navbar-item/auth-navbar-item.vue'
import MobileMenuToggleButton from './mobile-menu-toggle-button/mobile-menu-toggle-button.vue'

@Options({
  components: {
    'menu-toggle-button': MobileMenuToggleButton,
    'project-selector': ProjectSelectorComponent,
    'auth-navbar-item': AuthNavbarItemComponent
  }
})

export default class NavigationBarComponent extends Vue {
  private readonly projectId: string = useRoute().params.projectId as string ?? ''
  public shouldShowMobileMenu: boolean = false

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

  // Menu

  public toggleMobileMenu (): void {
    console.log('toggleMobileMenu b', this.shouldShowMobileMenu)
    this.shouldShowMobileMenu = !this.shouldShowMobileMenu
    console.log('toggleMobileMenu a', this.shouldShowMobileMenu)
  }
}
