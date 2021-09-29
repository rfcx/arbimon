import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import SpeciesRichnessMaps from '@/components/species-richness-maps/species-richness-maps.vue'
import { ChartModels, SiteModels, SpeciesRichnessFilter } from '@/models'
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
  public sites: SiteModels.Site[] = []

  public chartData: ChartModels.GroupedBarChartItem[] = []
  mapDatasets: ChartModels.MapDataSet[] = []

  async onFilterChange (filters: SpeciesRichnessFilter[]): Promise<void> {
    const groupedItems: { [key: string]: ChartModels.GroupedBarChartItem } = {}
    const chartItems = await Promise.all(filters.map(({ startDate, endDate, sites }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return SpeciesService.getMockupSpecies({ start, end, sites })
    }))

    const categories = new Set(chartItems.flatMap(i => i.map(c => c.category)))
    categories.forEach(cat => {
      for (const [idx, item] of chartItems.entries()) {
        const filter = filters[idx]
        const siteName = filter.sites.length > 0 ? filter.sites.map(s => s.name).join(',') : 'All sites'
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

    this.chartData = Object.values(groupedItems).sort((a, b) => a.group.localeCompare(b.group))

    // TODO 41 - Merge this with the above once Nutto's branch is merged
    this.mapDatasets = filters.map(({ startDate, endDate, sites, color }) => ({
      color,
      data: SpeciesService.getSpeciesMapData({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), sites })
    }))
  }
}
