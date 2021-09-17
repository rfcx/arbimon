import { Options, Vue } from 'vue-class-component'
import { useRoute } from 'vue-router'

import { ProjectModels } from '@/models'
import { NavMenu } from '@/models/Navbar'
import { ROUTES_NAME } from '@/router'
import { VXServices } from '@/services'
import ProjectSelectorComponent from '../project-selector/project-selector.vue'
import AuthNavbarItemComponent from './auth-navbar-item/auth-navbar-item.vue'
import MobileMenuToggleButton from './mobile-menu-toggle-button/mobile-menu-toggle-button.vue'

@Options({
  components: {
    MobileMenuToggleButton,
    ProjectSelectorComponent,
    AuthNavbarItemComponent
  }
})

export default class NavigationBarComponent extends Vue {
  @VXServices.Project.selectedProject.VX()
  selectedProject!: ProjectModels.ProjectListItem | undefined

  public hasToggledMobileMenu: boolean = false
  public hasOpenedProjectSelector: boolean = false

  public get unselectedProject (): boolean {
    return !this.selectedProject || this.selectedProjectId === ''
  }

  public get navMenus (): NavMenu[] {
    if (this.unselectedProject) return []
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

  public get selectedProjectName (): string {
    return this.selectedProject?.name ?? 'Select Project'
  }

  public get selectedProjectId (): string {
    return this.selectedProject?.id ?? useRoute().params.projectId as string ?? ''
  }

  public get arbimonLink (): string {
    if (this.unselectedProject) return ''
    // TODO 17: change this to support staging / production
    else { return `https://arbimon.rfcx.org/project/${this.selectedProjectId}` }
  }

  // Menu

  public toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  public toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
