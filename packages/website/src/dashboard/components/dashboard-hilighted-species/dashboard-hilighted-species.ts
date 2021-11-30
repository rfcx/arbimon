import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

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

  // TODO: Should move to somewhere
  getSpeciesCategory (category: string): string {
    switch (category) {
      case 'EX': return 'Extinct'
      case 'EW': return 'Extinct in the wild'
      case 'RE': return 'Regionally extinct'
      case 'CR': return 'Critically endangered'
      case 'EN': return 'Endangered'
      case 'VU': return 'Vulnerable'
      case 'NT': return 'Near threatened'
      case 'LC': return 'Least concern'
      case 'DD': return 'Data deficient'
      case 'NA': return 'Not applicable'
      default: return 'Not evaluated' // 'NE'
    }
  }
}
