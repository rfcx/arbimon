import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

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
  @Prop() metrics!: Metrics[]
}
