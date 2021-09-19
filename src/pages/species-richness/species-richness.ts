import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import { SpeciesRichnessFilter, StreamModels } from '@/models'
import { StreamServices } from '@/services'

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  public chartData = [
    {
      label: 'birds',
      population: 1000
    },
    {
      label: 'mammal',
      population: 1500
    },
    {
      label: 'reptile',
      population: 800
    }
  ]

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
