import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'
import { Metrics } from './components/dashboard-metrics/dashboard-metrics'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectProfile from './components/dashboard-project-profile/dashboard-project-profile.vue'
import DashboardSitemap from './components/dashboard-sitemap/dashboard-sitemap.vue'
import { dashboardService } from './services'

export interface Profile {
  description: string
  information: string // markdown string
}

export interface DashboardData {
  metrics: Metrics
  profile: Profile
}

@Options({
  components: {
    DashboardMetrics,
    DashboardProjectProfile,
    DashboardSitemap
  }
})
export default class DashboardPage extends Vue {
  @Inject() readonly store!: BiodiversityStore
  metrics: Metrics | null = null
  profile: Profile | null = null

  override async mounted (): Promise<void> {
    await this.getDashboardInformation()
  }

  async getDashboardInformation (): Promise<void> {
    // Get data
    const projectId = this.store.selectedProject?.id
    if (!projectId) return

    const data = await dashboardService.getDashboardInformation(projectId)
    if (!data) return // TODO: Show error message

    // Bind
    const { metrics, profile } = data
    this.metrics = metrics
    this.profile = profile
  }
}
