import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

export interface DashboardRichnessData {
  taxonClass: string
  speciesNo: number
}

export interface DashboardRichnessPercentage {
  taxonClass: string
  percentage: number
}

export default class DashboardTopTaxons extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop() totalSpecies!: number
  @Prop() richness!: DashboardRichnessData[]

  get richnessRoutename (): string {
    return ROUTE_NAMES.species_richness
  }

  get projectId (): string | undefined {
    return this.store.selectedProject?.id
  }

  get richnessPercentage (): DashboardRichnessPercentage[] {
    const { richness, totalSpecies } = this
    return richness.map(({ taxonClass, speciesNo }) => {
      return {
        taxonClass,
        percentage: (speciesNo / totalSpecies) * 100
      }
    })
  }

  displayPercentage (percentage: number): string {
    return percentage.toFixed(1)
  }
}
