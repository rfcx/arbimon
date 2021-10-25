import { Options, Vue } from 'vue-class-component'

import { Metrics } from '@/activity-patterns/types'
import MetricsTitle from './metrics-title.vue'
import MultiMetrics from './multi-metrics.vue'
import SingleMetrics from './single-metrics.vue'

@Options({
  components: {
    MetricsTitle,
    MultiMetrics,
    SingleMetrics
  }
})
export default class ActivityPatternsMetrics extends Vue {
  get metricsInformation (): Metrics[] {
    return [
      {
        title: 'Detection frequency',
        information: 'Number of recordings as a proportion of total recordings',
        datasets: [
          {
            value: 25,
            description: 'Found in 25 recordings out of 100 recordings'
          },
          {
            value: 35,
            description: 'Found in 350 recordings out of 1000 recordings'
          }
        ]
      },
      {
        title: 'Occupancy',
        information: 'Number of sites with a detection',
        datasets: [
          {
            value: 45,
            description: 'Found in 45 sites out of 100 sites'
          },
          {
            value: 50,
            description: 'Found in 25 sites out of 50 sites'
          }
        ]
      }
    ]
  }
}
