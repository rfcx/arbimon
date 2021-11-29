import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'
import { Metrics } from './components/dashboard-metrics/dashboard-metrics'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectProfile from './components/dashboard-project-profile/dashboard-project-profile.vue'
import DashboardSitemap from './components/dashboard-sitemap/dashboard-sitemap.vue'
import { DashboardRichnessData } from './components/dashboard-top-taxons/dashboard-top-taxons'
import DashboardTopTaxons from './components/dashboard-top-taxons/dashboard-top-taxons.vue'
import { dashboardService } from './services'

export interface DashboardGeneratedData {
  metrics: Metrics
  richness: DashboardRichnessData[]
}

export interface DashboardProfileData {
  description: string
  readme: string // markdown string
}

@Options({
  components: {
    DashboardMetrics,
    DashboardProjectProfile,
    DashboardSitemap,
    DashboardTopTaxons
  }
})
export default class DashboardPage extends Vue {
  @Inject() readonly store!: BiodiversityStore

  metrics: Metrics | null = null
  projectDescription: string | null = null
  projectReadme: string | null = null
  richness: DashboardRichnessData[] | null = null

  override async mounted (): Promise<void> {
    await this.getData()
  }

  async getData (): Promise<void> {
    // Get data
    const projectId = this.store.selectedProject?.id
    if (!projectId) return

    await Promise.all([
      this.getGeneratedData(projectId),
      this.getProfileData(projectId)
    ])
  }

  async getGeneratedData (projectId: string): Promise<void> {
    const generated = await dashboardService.getDashboardGeneratedData(projectId)
    if (generated) {
      this.metrics = generated.metrics
      this.richness = generated.richness
    }
  }

  async getProfileData (projectId: string): Promise<void> {
    const profile = await dashboardService.getDashboardProfileData(projectId)
    if (profile) {
      this.projectDescription = profile.description
      this.projectReadme = profile.readme
    }
  }
}
