import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { isDefined } from '@rfcx-bio/utils/predicates'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import ActivityOverviewBySpecies from '@/activity-overview/components/activity-overview-by-species/activity-overview-by-species.vue'
import ActivityOverviewByTime from '@/activity-overview/components/activity-overview-by-time/activity-overview-by-time.vue'
import { exportCSV, transformToBySiteDatasets } from '@/activity-overview/functions'
import { activityService } from '@/activity-overview/services'
import { INFO_TOPICS } from '@/info/info-page'
import { ActivityOverviewDataBySpecies } from '~/api/activity-overview-service'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { BiodiversityStore } from '~/store'
import { SpeciesDataset } from './components/activity-overview-by-species/activity-overview-by-species'
import { ActivityOverviewTimeDataset } from './components/activity-overview-by-time/activity-overview-by-time'

const DEFAULT_PREFIX = 'Activity-Overview-Raw-Data'

@Options({
  components: {
    ComparisonListComponent,
    ActivityOverviewByLocation,
    ActivityOverviewByTime,
    ActivityOverviewBySpecies
  }
})
export default class ActivityOverviewPage extends Vue {
  @Inject() readonly store!: BiodiversityStore

  filters!: ColoredFilter[]

  mapDatasets: MapDataSet[] = []
  timeDatasets: ActivityOverviewTimeDataset[] = []
  tableDatasets: SpeciesDataset[] = []
  exportDatasets: ActivityOverviewDataBySpecies[][] = []

  get hasData (): boolean {
    return this.exportDatasets.length > 0
  }

  get infoTopic (): string {
    return INFO_TOPICS.activity
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filters = filters
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    const filters = this.filters

    const datasets = (await Promise.all(
      filters.map(async (filter) => {
        const { color, startDate, endDate, otherFilters, sites } = filter
        const data = await activityService.getActivityDataset(filterToDataset(filter))
        if (!data) return undefined

        return { ...data, otherFilters, startDate, endDate, color, sites: sites.flatMap(({ value }) => value) }
      })
    )).filter(isDefined)

    this.mapDatasets = transformToBySiteDatasets(datasets)
    this.timeDatasets = datasets.map(({ color, detectionsByTimeDay, detectionsByTimeHour, detectionsByTimeMonth, detectionsByTimeDate }) => {
      const data = {
        hourOfDay: detectionsByTimeHour,
        dayOfWeek: detectionsByTimeDay,
        monthOfYear: detectionsByTimeMonth,
        dateSeries: detectionsByTimeDate
      }
      return { color, data }
    })
    this.tableDatasets = datasets.map(({ color, detectionsBySpecies }) => ({ color, data: detectionsBySpecies }))
    this.exportDatasets = datasets.map(({ detectionsBySpecies }) => detectionsBySpecies)
  }

  async exportSpeciesData (): Promise<void> {
    await exportCSV(this.filters, this.exportDatasets, DEFAULT_PREFIX)
  }
}
