import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import { ChartModels, SpeciesRichnessFilter, StreamModels } from '@/models'
import { SpeciesService } from '@/services'

dayjs.extend(utc)

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  public chartData: ChartModels.GroupedBarChartItem[] = []

  onFilterChange (filters: SpeciesRichnessFilter[]): void {
    const groupedItems: { [key: string]: ChartModels.GroupedBarChartItem } = {}
    for (const filter of filters) {
      const start = filter.startDate.toISOString()
      const end = filter.endDate.add(1, 'days').toISOString()
      const chartItems = SpeciesService.getMockupSpecies({ start, end, streams: filter.streams })
      for (const chartItem of chartItems) {
        const group = groupedItems[chartItem.category]
        if (group !== undefined) {
          groupedItems[chartItem.category].series.push({
            category: filter.streams.length > 0 ? filter.streams.map(s => s.name).join(',') : 'All sites',
            frequency: chartItem.frequency
          })
        } else {
          groupedItems[chartItem.category] = {
            category: chartItem.category,
            series: [
              {
                category: filter.streams.length > 0 ? filter.streams.map(s => s.name).join(',') : 'All sites',
                frequency: chartItem.frequency
              }
            ]
          }
        }
      }
    }
    this.chartData = Object.values(groupedItems)
  }
}
