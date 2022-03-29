import { Options, Vue } from 'vue-class-component'
import { Inject, Watch } from 'vue-property-decorator'
import { RouteLocationNormalized } from 'vue-router'

import { RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { GroupedBarChartItem } from '~/charts/horizontal-bar-chart'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { BiodiversityStore } from '~/store'
import { TimeBucket } from '~/time-buckets'
import SpeciesRichnessByClass from './components/species-richness-by-class/species-richness-by-class.vue'
import SpeciesRichnessByLocation from './components/species-richness-by-location/species-richness-by-location.vue'
import SpeciesRichnessByTime from './components/species-richness-by-time/species-richness-by-time.vue'
import SpeciesRichnessDetectedSpecies from './components/species-richness-detected-species/species-richness-detected-species.vue'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/types'
import SpeciesRichnessIntroduction from './components/species-richness-introduction/species-richness-introduction.vue'
import { getBarChartDataset, getMapDataset, getTableData } from './functions'
import { richnessService } from './services'

@Options({
  components: {
    ComparisonListComponent,
    SpeciesRichnessByClass,
    SpeciesRichnessByLocation,
    SpeciesRichnessByTime,
    SpeciesRichnessDetectedSpecies,
    SpeciesRichnessIntroduction
  }
})
export default class SpeciesRichnessPage extends Vue {
  @Inject() readonly store!: BiodiversityStore

  colors: string[] = [] // TODO 150 - Replace this with Pinia colors
  filters: ColoredFilter[] = []
  speciesByClassDatasets: GroupedBarChartItem[] = []
  speciesByLocationDatasets: MapDataSet[] = []
  speciesByTimeDatasets: Array<{color: string, data: Record<TimeBucket, Record<number, number>>}> = []
  speciesByExports: RichnessByExportReportRow[][] = []
  detectedSpecies: DetectedSpeciesItem[] = []

  get haveData (): boolean {
    return this.speciesByClassDatasets.length > 0
  }

  @Watch('$route')
  async onRouterChange (to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<void> {
    if (to.params.projectSlug !== from.params.projectSlug) {
      await this.onDatasetChange()
    }
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filters = filters
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    // TODO 117 - Only update the changed dataset
    const datasets = await (await Promise.all(
      this.filters.map(async (filter) => {
        const { startDate, endDate, sites, color, otherFilters } = filter
        const data = await richnessService.getRichnessDataset(filterToDataset(filter))
        return data ? { startDate, endDate, sites, color, otherFilters, data } : data
      })
    )).filter(isDefined)

    this.colors = datasets.map(ds => ds.color)
    this.speciesByClassDatasets = getBarChartDataset(datasets)
    this.speciesByLocationDatasets = getMapDataset(datasets)
    this.speciesByTimeDatasets = datasets
      .map(({ color, data }) => {
        const { richnessByTimeHourOfDay, richnessByTimeDayOfWeek, richnessByTimeMonthOfYear, richnessByTimeUnix } = data
        return {
          color,
          data: {
            hourOfDay: richnessByTimeHourOfDay,
            dayOfWeek: richnessByTimeDayOfWeek,
            monthOfYear: richnessByTimeMonthOfYear,
            dateSeries: richnessByTimeUnix
          }
        }
      })
    this.detectedSpecies = getTableData(datasets)
    this.speciesByExports = datasets.map(({ data }) => data.richnessExport)
  }
}
