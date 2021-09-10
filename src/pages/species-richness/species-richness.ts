import { Options, Vue } from 'vue-class-component'

import ComparisonBoxComponent from '@/components/comparison-list/comparison-list.vue'
import { SpeciesRichnessFilter } from '@/models'

@Options({
  components: {
    'comparison-list': ComparisonBoxComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  onFilterChange (filters: SpeciesRichnessFilter[]): void {
    //
  }
}
