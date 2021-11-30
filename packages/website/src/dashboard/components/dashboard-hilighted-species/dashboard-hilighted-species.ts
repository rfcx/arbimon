import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { getSpeciesCategory } from '@rfcx-bio/common/species/species-categories'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'
import { DashboardSpecies } from '../../dashboard'

export default class DashboardHilightedSpecies extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop() species!: DashboardSpecies[] | null

  get activityOverview (): string {
    return ROUTE_NAMES.activity_overview
  }

  get activityPatternRoutename (): string {
    return ROUTE_NAMES.activity_patterns
  }

  get projectId (): string | undefined {
    return this.store.selectedProject?.id
  }

  get hasData (): boolean {
    return this.species !== null && this.species?.length > 0
  }

  speciesImage (thumbnailImage: string | undefined): string {
    return thumbnailImage ?? new URL('../../assets/default-species-image.jpg', import.meta.url).toString()
  }

  displayCategory (category: string): string {
    return getSpeciesCategory(category)
  }
}
