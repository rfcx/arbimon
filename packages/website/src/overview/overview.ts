import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { Metrics } from '@rfcx-bio/common/api-types/dashboard'

import { dashboardService } from '~/api/dashboard-service'
import { BiodiversityStore } from '~/store'
import OverviewMetrics from './components/overview-metrics/overview-metrics.vue'
import OverviewSitemap from './components/overview-sitemap/overview-sitemap.vue'
import ProjectInfo from './components/project-info/project-info.vue'

@Options({
  components: {
    OverviewMetrics,
    OverviewSitemap,
    ProjectInfo
  }
})
export default class OverviewPage extends Vue {
  @Inject() readonly store!: BiodiversityStore
  metrics: Metrics | null = null

  override async mounted (): Promise<void> {
    await this.getDashboardInformation()
  }

  async getDashboardInformation (): Promise<void> {
    try {
      const { metrics } = await dashboardService.getDashboardInformation()
      this.metrics = metrics
    } catch {
      // TODO: Handle API error
    }
  }
}
