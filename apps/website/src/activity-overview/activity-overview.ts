import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import ActivityOverviewBySpecies from '@/activity-overview/components/activity-overview-by-species/activity-overview-by-species.vue'
import ActivityOverviewByTime from '@/activity-overview/components/activity-overview-by-time/activity-overview-by-time.vue'
import { transformToBySiteDatasets } from '@/activity-overview/functions'
import { TimeDataset } from '@/activity-overview/types'
import { ActivityOverviewDataBySpecies, activityOverviewService } from '~/api/activity-overview-service'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { BiodiversityStore } from '~/store'

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
  timeDatasets: TimeDataset[] = []
  tableDatasets: ActivityOverviewDataBySpecies[] = []

  get hasData (): boolean {
    return this.tableDatasets.length > 0
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filters = filters
    await this.onDatasetChange()
  }

  // TODO: Dix bound single filter to multi filter
  async onDatasetChange (): Promise<void> {
    const filters = this.filters
    const datasets = await Promise.all(
      filters.map(async (filter) => {
        const { color, startDate, endDate } = filter
        const data = await activityOverviewService.getActivityOverviewData(filterToDataset(filter))
        return { ...data, startDate, endDate, color }
      })
    )

    this.mapDatasets = transformToBySiteDatasets(datasets)
    this.timeDatasets = datasets.map(({ color, overviewByTime }) => ({ color, data: overviewByTime }))
    // this.tableDatasets = data.overviewBySpecies
  }

  async exportSpeciesData (): Promise<void> {
    // await exportCSV(this.filter, this.tableDatasets, DEFAULT_PREFIX)
  }
}
