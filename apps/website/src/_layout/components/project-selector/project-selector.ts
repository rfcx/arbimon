import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject } from 'vue-property-decorator'
import { RouteParamsRaw } from 'vue-router'

import { LocationProjectLight } from '@rfcx-bio/common/dao/types'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Emit() emitCloseProjectSelector (): boolean { return false }

  newSelectedProject: LocationProjectLight | null = null

  get selectedProject (): LocationProjectLight | null {
    return this.store.selectedProject ?? null
  }

  override created (): void {
    this.newSelectedProject = this.selectedProject
      ? { ...this.selectedProject }
      : null
  }

  isSelectedProject (project: LocationProjectLight): boolean {
    return project.id === this.newSelectedProject?.id
  }

  setSelectedProject (project: LocationProjectLight): void {
    this.newSelectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    if (this.newSelectedProject) {
      await this.store.updateSelectedProject(this.newSelectedProject)
      const params: RouteParamsRaw = { projectSlug: this.newSelectedProject.slug }
      if (this.$route.name === ROUTE_NAMES.activityPatterns) {
        await this.$router.push({ params: { ...params, speciesSlug: undefined } })
      } else {
        await this.$router.push({ params })
      }
    }
    this.emitCloseProjectSelector()
  }
}
