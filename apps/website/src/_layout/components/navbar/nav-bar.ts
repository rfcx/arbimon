import { Options, Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'
import { RouteLocationRaw } from 'vue-router'

import ProjectSelector from '@/_layout/components/project-selector/project-selector.vue'
import { storeKey, togglesKey } from '@/globals'
import { FeatureToggles } from '~/feature-toggles'
import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'
import AuthNavbarItemComponent from './auth-navbar-item/auth-navbar-item.vue'
import MobileMenuToggleButton from './mobile-menu-toggle-button/mobile-menu-toggle-button.vue'

export interface NavMenu {
  label: string
  destination: RouteLocationRaw
  role?: string[]
  isParent?: boolean
}

@Options({
  components: {
    AuthNavbarItemComponent,
    MobileMenuToggleButton,
    ProjectSelector
  }
})
export default class NavbarComponent extends Vue {
  @Inject({ from: togglesKey }) readonly toggles!: FeatureToggles
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
  @Prop({ default: false }) isReport!: boolean

  hasToggledMobileMenu = false
  hasOpenedProjectSelector = false

  get selectedProjectName (): string {
    return this.store.selectedProject?.name ?? 'Select Project'
  }

  get navMenus (): NavMenu[] {
    if (this.isReport) return this.reportMenus
    return this.globalNavMenus
  }

  get reportMenus (): NavMenu[] {
    const projectSlug = this.store.selectedProject?.slug
    return projectSlug !== undefined
      ? [
          {
            label: 'Dashboard',
            destination: { name: ROUTE_NAMES.dashboard, params: { projectSlug } },
            isParent: true
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

  get globalNavMenus (): NavMenu[] {
    const projectSlug = this.store.selectedProject?.slug
    return projectSlug !== undefined
      ? [
          {
            label: 'Deploy',
            destination: { name: ROUTE_NAMES.home }
          },
          {
            label: 'Upload',
            destination: { name: ROUTE_NAMES.home }
          },
          {
            label: 'Detect',
            destination: { name: ROUTE_NAMES.cnnJobList, params: { projectSlug } }
          },
          {
            label: 'Explore',
            destination: { name: ROUTE_NAMES.dashboard, params: { projectSlug } }
          }
        ]
      : []
  }

  get arbimonLink (): string {
    const selectedProjectSlug = this.store.selectedProject?.slug
    if (selectedProjectSlug === undefined || !this.isReport) return ''
    else return `${import.meta.env.VITE_ARBIMON_BASE_URL}/project/${selectedProjectSlug}`
  }

  get isPride (): boolean {
    return this.toggles.logoPride && new Date().getMonth() === 5 // June
  }

  toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
