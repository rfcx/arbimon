import { Options, Vue } from 'vue-class-component'

import ComparisonBoxComponent from '@/components/comparison-list/comparison-list.vue'
import { SpeciesRichnessFilter, StreamModels } from '@/models'
import { StreamServices } from '@/services'

@Options({
  components: {
    'comparison-list': ComparisonBoxComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  async mounted (): Promise<void> {
    await this.getStreams()
  }

  // Example: to be update
  async getStreams (): Promise<void> {
    this.streams = await StreamServices.getStreams()
  }

  onFilterChange (filters: SpeciesRichnessFilter[]): void {
    //
  }
}
