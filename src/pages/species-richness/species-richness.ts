import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import { SpeciesModels, SpeciesRichnessFilter, StreamModels } from '@/models'
import { SpeciesService } from '@/services'

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  public chartData: SpeciesModels.SpeciesRichnessBarChartItem[] = []

  onFilterChange (filters: SpeciesRichnessFilter[]): void {
    for (const filter of filters) {
      const start = filter.startDate?.toISOString() ?? ''
      const end = filter.endDate?.toISOString() ?? ''
      const data = SpeciesService.getMockupSpecies({ start, end, streams: filter.streams })
      this.chartData = data
    }
  }
}
