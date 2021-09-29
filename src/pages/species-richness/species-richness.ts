import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import SpeciesRichnessMaps from '@/components/species-richness-maps/species-richness-maps.vue'
import { ChartModels, SpeciesRichnessFilter, StreamModels } from '@/models'
import { SpeciesService } from '@/services'

dayjs.extend(utc)

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent,
    SpeciesRichnessMaps
  }
})
export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  public chartData: ChartModels.GroupedBarChartItem[] = []
  mapDatasets: ChartModels.MapDataSet[] = []

  async onFilterChange (filters: SpeciesRichnessFilter[]): Promise<void> {
    const groupedItems: { [key: string]: ChartModels.GroupedBarChartItem } = {}
    const chartItems = await Promise.all(filters.map(f => {
      const start = f.startDate.toISOString()
      const end = f.endDate.add(1, 'days').toISOString()
      return SpeciesService.getMockupSpecies({ start, end, streams: f.streams })
    }))

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

    // TODO 41 - Merge this with the above once Nutto's branch is merged
    this.mapDatasets = filters.map(({ startDate, endDate, streams, color }) => ({
      color,
      data: SpeciesService.getSpeciesMapData({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), streams })
    }))
  }
}
