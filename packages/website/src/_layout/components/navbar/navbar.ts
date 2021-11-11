import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'
import { RouteLocationRaw } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'
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
  @Inject() readonly store!: BiodiversityStore

  hasToggledMobileMenu = false
  hasOpenedProjectSelector = false

  get selectedProjectName (): string {
    return this.store.selectedProject?.name ?? 'Select Project'
  }

  get navMenus (): NavMenu[] {
    const selectedProjectId = this.store.selectedProject?.id
    return selectedProjectId
      ? [
          {
            label: 'Overview',
            destination: { name: ROUTE_NAMES.overview, params: { projectId: selectedProjectId } }
          },
          {
            label: 'Richness',
            destination: { name: ROUTE_NAMES.species_richness, params: { projectId: selectedProjectId } }
          },
          {
            label: 'Activity',
            destination: { name: ROUTE_NAMES.error }
          },
          {
            label: 'Spotlight',
            destination: { name: ROUTE_NAMES.activity_patterns, params: { projectId: selectedProjectId } }
          }
        ]
      : []
  }

  get arbimonLink (): string {
    const selectedProjectId = this.store.selectedProject?.id
    if (!selectedProjectId) return ''
    else return `https://arbimon.rfcx.org/project/${selectedProjectId}` // TODO 17: change this to support staging / production
  }

  toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
