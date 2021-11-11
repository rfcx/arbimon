import { Options, Vue } from 'vue-class-component'

import { ColoredFilter } from '~/dataset-filters'
import { ComparisonListComponent } from '~/dataset-filters/comparison-list'

@Options({
  components: {
    ComparisonListComponent
  }
})
export default class ActivityOverviewPage extends Vue {
  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    //
  }
}
