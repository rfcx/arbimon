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
    const chartItems: ChartModels.BarChartItem[][] = []
    for (const filter of filters) {
      const start = filter.startDate.toISOString()
      const end = filter.endDate.add(1, 'days').toISOString()
      const data = SpeciesService.getMockupSpecies({ start, end, streams: filter.streams })
      chartItems.push(data)
    }

    const categories = new Set(chartItems.flatMap(i => i.map(c => c.category)))
    categories.forEach(cat => {
      for (const [idx, item] of chartItems.entries()) {
        const filter = filters[idx]
        const siteName = filter.streams.length > 0 ? filter.streams.map(s => s.name).join(',') : 'All sites'
        const matchedData = item.find(d => d.category === cat)
        const seriesItem: ChartModels.BarChartItem = {
          category: siteName,
          frequency: matchedData?.frequency ?? 0,
          color: filter.color
        }
        if (groupedItems[cat] !== undefined) {
          groupedItems[cat].series.unshift(seriesItem)
        } else {
          groupedItems[cat] = {
            group: cat,
            series: [seriesItem]
          }
        }
      }
    })

    this.chartData = Object.values(groupedItems)
  }
}
