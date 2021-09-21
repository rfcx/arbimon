import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import { SpeciesRichnessFilter, StreamModels } from '@/models'

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent
  }
})
export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  public chartData = [
    {
      label: 'birds',
      population: 1000
    },
    {
      label: 'mammal',
      population: 1500
    },
    {
      label: 'reptile',
      population: 800
    }
  ]

  onFilterChange (filters: SpeciesRichnessFilter[]): void {
    //
  }
}
