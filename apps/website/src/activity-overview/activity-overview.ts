import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { isDefined } from '@rfcx-bio/utils/predicates'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import ActivityOverviewBySpecies from '@/activity-overview/components/activity-overview-by-species/activity-overview-by-species.vue'
import ActivityOverviewByTime from '@/activity-overview/components/activity-overview-by-time/activity-overview-by-time.vue'
import { exportCSV, transformToBySiteDatasets } from '@/activity-overview/functions'
import { activityService } from '@/activity-overview/services'
import { TimeDataset } from '@/activity-overview/types'
import { INFO_TOPICS } from '@/info/info-page'
import { ActivityOverviewDataBySpecies } from '~/api/activity-overview-service'
import { ColoredFilter, ComparisonListComponent, filterToDataset } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { BiodiversityStore } from '~/store'
import { SpeciesDataset } from './components/activity-overview-by-species/activity-overview-by-species'

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
  tableDatasets: SpeciesDataset[] = []
  exportDatasets: ActivityOverviewDataBySpecies[][] = []

  get hasData (): boolean {
    return this.exportDatasets.length > 0
  }

  get infoTopic (): string {
    return INFO_TOPICS.activity
  }

  // override async created (): Promise<void> {
  //   const projectId = this.store.selectedProject?.id
  //   if (!projectId) return

  //   const dataset = await activityService.getActivityDataset()
  //   console.log('look here', dataset)
  // }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filters = filters
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    const filters = this.filters

    const datasets = (await Promise.all(
      filters.map(async (filter) => {
        const { color, startDate, endDate, otherFilters } = filter
        const data = await activityService.getActivityDataset(filterToDataset(filter))
        if (!data) return undefined

        return { ...data, otherFilters, startDate, endDate, color }
      })
    )).filter(isDefined)

    this.mapDatasets = transformToBySiteDatasets(datasets)
    this.timeDatasets = datasets.map(({ color, overviewByTime }) => ({ color, data: overviewByTime }))
    this.tableDatasets = datasets.map(({ color, overviewBySpecies }) => ({ color, data: overviewBySpecies }))
    this.exportDatasets = datasets.map(({ overviewBySpecies }) => overviewBySpecies)
  }

  async exportSpeciesData (): Promise<void> {
    await exportCSV(this.filters, this.exportDatasets, DEFAULT_PREFIX)
  }
}
