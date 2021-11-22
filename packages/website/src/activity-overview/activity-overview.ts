import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import { transformToBySiteDataset } from '@/activity-overview/functions'
import { activityOverviewService } from '~/api/activity-overview-service'
import { ColoredFilter } from '~/dataset-filters'
import { ComparisonListComponent } from '~/dataset-filters/comparison-list'
import { filterToDataset } from '~/dataset-filters/functions'
import { FeatureToggles } from '~/feature-toggles'
import { MapDataSet } from '~/maps/map-bubble'

@Options({
  components: {
    ComparisonListComponent,
    ActivityOverviewByLocation
  }
})
export default class ActivityOverviewPage extends Vue {
  @Inject() readonly toggles!: FeatureToggles

  filter!: ColoredFilter

  mapDatasets: MapDataSet[] = []

  // TODO ??: Use individual comparison box
  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filter = filters[0]
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    const { color, ...filter } = this.filter
    const data = await activityOverviewService.getActivityOverviewData(filterToDataset(filter))

    this.mapDatasets = transformToBySiteDataset({ ...data, startDate: filter.startDate, endDate: filter.endDate, color })
  }
}
