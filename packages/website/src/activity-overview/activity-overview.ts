import { Options, Vue } from 'vue-class-component'

import ActivityOverviewByLocation from '@/activity-overview/components/activity-overview-by-location/activity-overview-by-location.vue'
import { activityOverviewService } from '~/api/activity-overview-service'
import { ColoredFilter } from '~/dataset-filters'
import { ComparisonListComponent } from '~/dataset-filters/comparison-list'
import { filterToDataset } from '~/dataset-filters/functions'

@Options({
  components: {
    ComparisonListComponent,
    ActivityOverviewByLocation
  }
})
export default class ActivityOverviewPage extends Vue {
  filter!: ColoredFilter

  // TODO ??: Use individual comparison box
  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    this.filter = filters[0]
    await this.onDatasetChange()
  }

  async onDatasetChange (): Promise<void> {
    const { color, ...filter } = this.filter
    const mapDataset = []

    const dataset = await activityOverviewService.getActivityOverviewData(filterToDataset(filter))
  }
}
