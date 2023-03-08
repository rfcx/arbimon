import type { AxiosInstance } from 'axios'
import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { apiBioGetRichnessDataset } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { apiClientBioKey, storeKey } from '@/globals'
import type { GroupedBarChartItem } from '~/charts/horizontal-bar-chart'
import type { ColoredFilter } from '~/filters'
import { ComparisonListComponent, filterToQuery } from '~/filters'
import type { MapDataSet } from '~/maps/types'
import type { BiodiversityStore } from '~/store'
import type { TimeBucket } from '~/time-buckets'
import SpeciesRichnessByClass from './components/species-richness-by-class/species-richness-by-class.vue'
import SpeciesRichnessByLocation from './components/species-richness-by-location/species-richness-by-location.vue'
import SpeciesRichnessByTime from './components/species-richness-by-time/species-richness-by-time.vue'
import SpeciesRichnessDetectedSpecies from './components/species-richness-detected-species/species-richness-detected-species.vue'
import type { DetectedSpeciesItem } from './components/species-richness-detected-species/types'
import SpeciesRichnessIntroduction from './components/species-richness-introduction/species-richness-introduction.vue'
import { getBarChartDataset, getMapDataset, getTableData } from './functions'

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
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
  @Inject({ from: apiClientBioKey }) readonly apiClientBio!: AxiosInstance

  colors: string[] = [] // TODO 150 - Replace this with Pinia colors
  filters: ColoredFilter[] = []
  loading: boolean = true
  speciesByClassDatasets: GroupedBarChartItem[] = []
  speciesByLocationDatasets: MapDataSet[] = []
  speciesByTimeDatasets: Array<{ color: string, data: Record<TimeBucket, Record<number, number>> }> = []
  detectedSpecies: DetectedSpeciesItem[] = []
  isLocationRedacted = true

  get hasData (): boolean {
    return this.speciesByClassDatasets.length > 0
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filters = filters
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    const projectId = this.store.selectedProject?.id
    if (projectId === undefined) return

    this.loading = true
    this.speciesByLocationDatasets = this.filters.map(filter => ({ ...filter, sites: [], data: [], maxValues: {} }))

    // TODO 117 - Only update the changed dataset
    const datasets = (await Promise.all(
      this.filters.map(async (filter) => {
        const { startDate, endDate, sites, color, otherFilters } = filter
        const data = await apiBioGetRichnessDataset(this.apiClientBio, projectId, filterToQuery(filter))
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
            date: richnessByTimeUnix
          }
        }
      })
    this.detectedSpecies = getTableData(datasets)
    this.isLocationRedacted = datasets[0]?.data.isLocationRedacted ?? true

    this.loading = false
  }
}
