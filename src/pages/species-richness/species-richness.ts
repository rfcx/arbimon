import { Options, Vue } from 'vue-class-component'

import ComparisonBoxComponent from '@/components/comparison-box/comparison-box.vue'
import { SpeciesRichnessFilter } from '@/models'

@Options({
  components: {
    'comparison-box': ComparisonBoxComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  onFilterChange (filters: SpeciesRichnessFilter[]): void {
    //
  }
}
