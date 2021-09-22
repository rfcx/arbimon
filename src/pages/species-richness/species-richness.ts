import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import { SpeciesModels, SpeciesRichnessFilter, StreamModels } from '@/models'
import { SpeciesService } from '@/services'
import { formatISOStringDate } from '@/utils'

dayjs.extend(utc)

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
      const start = formatISOStringDate(filter.startDate.startOf('day'))
      const end = formatISOStringDate(filter.endDate.endOf('day').add(1, 'days'))
      const data = SpeciesService.getMockupSpecies({ start, end, streams: filter.streams })
      this.chartData = data
    }
  }
}
