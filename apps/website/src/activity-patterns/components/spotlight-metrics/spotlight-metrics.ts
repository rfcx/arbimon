import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { type Metrics } from '@/activity-patterns/types'
import MetricsTitle from './metrics-title.vue'
import MetricsMulti from './multi-metrics.vue'
import MetricsSingle from './single-metrics.vue'

@Options({
  components: {
    MetricsTitle,
    MetricsMulti,
    MetricsSingle
  }
})
export default class ActivityPatternsMetrics extends Vue {
  @Prop() metrics!: Metrics[]
  @Prop({ default: false }) loading!: boolean
}
