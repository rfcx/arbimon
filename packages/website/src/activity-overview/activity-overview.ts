import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import ActivityOverviewBySpecies from '@/activity-overview/components/activity-overview-by-species/activity-overview-by-species.vue'
import ActivityOverviewByTime from '@/activity-overview/components/activity-overview-by-time/activity-overview-by-time.vue'
import { exportCSV, transformToBySiteDataset } from '@/activity-overview/functions'
import { TimeDataset } from '@/activity-patterns/types'
import { ActivityOverviewDataBySpecies, activityOverviewService } from '~/api/activity-overview-service'
import { ColoredFilter } from '~/dataset-filters'
import { ComparisonListComponent } from '~/dataset-filters/comparison-list'
import { filterToDataset } from '~/dataset-filters/functions'
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

  filter!: ColoredFilter

  mapDatasets: MapDataSet[] = []
  timeDatasets: TimeDataset[] = []
  tableDatasets: ActivityOverviewDataBySpecies[] = []

  get hasData (): boolean {
    return this.tableDatasets.length > 0
  }

  // TODO ??: Use individual comparison box
  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filter = filters[0]
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    const { color, ...filter } = this.filter
    const data = await activityOverviewService.getActivityOverviewData(filterToDataset(filter))

    // TODO ???: Update color logic
    this.mapDatasets = transformToBySiteDataset({ ...data, startDate: filter.startDate, endDate: filter.endDate, color })
    this.timeDatasets = data.overviewByTime.map((data, idx) => ({ color: this.store.datasetColors[idx], data }))
    this.tableDatasets = data.overviewBySpecies
  }

  async exportCSV (): Promise<void> {
    await exportCSV(this.filter, this.tableDatasets, DEFAULT_PREFIX)
  }
}
