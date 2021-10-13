import { Options, Vue } from 'vue-class-component'
import { RouteLocationRaw } from 'vue-router'

import { Project } from '@/_services/api'
import { Auth0User } from '@/_services/auth/types'
import { ROUTE_NAMES } from '@/_services/router'
import { VuexAuth, VuexProject } from '@/_services/store'
import ProjectSelectorComponent from '../project-selector/project-selector.vue'
import AuthNavbarItemComponent from './auth-navbar-item/auth-navbar-item.vue'
import MobileMenuToggleButton from './mobile-menu-toggle-button/mobile-menu-toggle-button.vue'

export interface NavMenu {
  label: string
  destination: RouteLocationRaw
  role?: string[]
}

@Options({
  components: {
    MobileMenuToggleButton,
    ProjectSelectorComponent,
    AuthNavbarItemComponent
  }
})
export default class NavbarComponent extends Vue {
  @VuexAuth.user.bind() user!: Auth0User | undefined
  @VuexProject.selectedProject.bind() selectedProject!: Project | undefined

  hasToggledMobileMenu = false
  hasOpenedProjectSelector = false

  get selectedProjectName (): string {
    return this.selectedProject?.name ?? 'Select Project'
  }

  get navMenus (): NavMenu[] {
    const selectedProjectId = this.selectedProject?.id
    return selectedProjectId
      ? [
          {
            label: 'Overview',
            destination: { name: ROUTE_NAMES.overview, params: { projectId: selectedProjectId } }
          },
          {
            label: 'Species Richness',
            destination: { name: ROUTE_NAMES.species_richness, params: { projectId: selectedProjectId } }
          }
        ]
      : []
  }

  get arbimonLink (): string {
    const selectedProjectId = this.selectedProject?.id
    if (!selectedProjectId) return ''
    else return `https://arbimon.rfcx.org/project/${selectedProjectId}` // TODO 17: change this to support staging / production
  }

  // Menu

  toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
