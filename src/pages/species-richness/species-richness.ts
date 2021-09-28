import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import MapBubbleComponent from '@/components/map-bubble/map-bubble.vue'
import { ChartModels, SpeciesRichnessFilter, StreamModels } from '@/models'
import { SpeciesService } from '@/services'

dayjs.extend(utc)

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent,
    MapBubbleComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  public chartData: ChartModels.BarChartItem[] = []
  mapDatasets: ChartModels.MapDataSet[] = []

  onFilterChange (filters: SpeciesRichnessFilter[]): void {
    for (const filter of filters) {
      const start = filter.startDate.toISOString()
      const end = filter.endDate.add(1, 'days').toISOString()
      const data = SpeciesService.getMockupSpecies({ start, end, streams: filter.streams })
      this.chartData = data
    }

    // TODO 41 - Merge this with the above once Nutto's branch is merged
    this.mapDatasets = filters.map(({ startDate, endDate, streams, color }) => ({
      color,
      data: SpeciesService.getSpeciesMapData({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), streams })
    }))
  }
}
