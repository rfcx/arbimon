import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

export default class DashboardTopTaxons extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop() totalSpecies!: number

  get richnessRoutename (): string {
    return ROUTE_NAMES.species_richness
  }

  get projectId (): string | undefined {
    return this.store.selectedProject?.id
  }
}
