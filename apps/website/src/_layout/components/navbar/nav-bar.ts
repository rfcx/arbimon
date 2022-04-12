import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'
import { RouteLocationRaw } from 'vue-router'

import ProjectSelector from '@/_layout/components/project-selector/project-selector.vue'
import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'
import AuthNavbarItemComponent from './auth-navbar-item/auth-navbar-item.vue'
import MobileMenuToggleButton from './mobile-menu-toggle-button/mobile-menu-toggle-button.vue'

export interface NavMenu {
  label: string
  destination: RouteLocationRaw
  role?: string[]
}

@Options({
  components: {
    AuthNavbarItemComponent,
    MobileMenuToggleButton,
    ProjectSelector
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
    const projectSlug = this.store.selectedProject?.slug
    return projectSlug !== undefined
      ? [
          {
            label: 'Dashboard',
            destination: { name: ROUTE_NAMES.dashboard, params: { projectSlug } }
          },
          {
            label: 'Richness',
            destination: { name: ROUTE_NAMES.speciesRichness, params: { projectSlug } }
          },
          {
            label: 'Activity',
            destination: { name: ROUTE_NAMES.activityOverview, params: { projectSlug } }
          },
          {
            label: 'Spotlight',
            destination: { name: ROUTE_NAMES.activityPatterns, params: { projectSlug } }
          }
        ]
      : []
  }

  get arbimonLink (): string {
    const selectedProjectSlug = this.store.selectedProject?.slug
    if (selectedProjectSlug === undefined) return ''
    else return `${import.meta.env.VITE_ARBIMON_BASE_URL}/project/${selectedProjectSlug}`
  }

  toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
