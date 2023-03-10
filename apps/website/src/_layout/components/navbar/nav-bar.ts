import { initDropdowns } from 'flowbite'
import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'
import type { RouteLocationRaw } from 'vue-router'

import ProjectSelector from '@/_layout/components/project-selector/project-selector.vue'
import { storeKey, togglesKey } from '@/globals'
import type { FeatureToggles } from '~/feature-toggles'
import { ROUTE_NAMES } from '~/router'
import type { BiodiversityStore } from '~/store'
import BrandLogo from '../fixed-navbar/brand-logo.vue'
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
    ProjectSelector,
    BrandLogo
  }
})
export default class NavbarComponent extends Vue {
  @Inject({ from: togglesKey }) readonly toggles!: FeatureToggles
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  hasToggledMobileMenu = false
  hasOpenedProjectSelector = false
  readonly ROUTE_NAMES = ROUTE_NAMES

  get isProjectLevel (): boolean {
    return this.$route.path.startsWith('/p/')
  }

  get selectedProjectName (): string {
    return this.store.selectedProject?.name ?? 'Select Project'
  }

  get projectMenuItems (): NavMenu[] {
    const projectSlug = this.store.selectedProject?.slug
    return projectSlug !== undefined
      ? [
          {
            label: 'Overview',
            destination: { name: ROUTE_NAMES.overview, params: { projectSlug } },
            isParent: true
          },
          {
            label: 'Import',
            destination: { name: ROUTE_NAMES.import, params: { projectSlug } }
          },
          {
            label: 'Acoustic Analyses',
            destination: { name: ROUTE_NAMES.cnnJobList, params: { projectSlug } }
          },
          {
            label: 'Insights',
            destination: { name: ROUTE_NAMES.speciesRichness, params: { projectSlug } }
          }
        ]
      : []
  }

  get arbimonLink (): string {
    const selectedProjectSlug = this.store.selectedProject?.slug
    if (selectedProjectSlug === undefined) return ''
    else return `${import.meta.env.VITE_ARBIMON_BASE_URL}/project/${selectedProjectSlug}`
  }

  get isPride (): boolean {
    return this.toggles.logoPride && new Date().getMonth() === 5 // June
  }

  override mounted (): void {
    initDropdowns()
  }

  toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
