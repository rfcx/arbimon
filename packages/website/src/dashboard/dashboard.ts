import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'
import DashboardEndangeredSpecies from './components/dashboard-endangered-species/dashboard-endangered-species.vue'
import DashboardHighlightedSpecies from './components/dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashboardLineChart from './components/dashboard-line-chart/dashboard-line-chart.vue'
import { Metrics } from './components/dashboard-metrics/dashboard-metrics'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectProfile from './components/dashboard-project-profile/dashboard-project-profile.vue'
import DashboardSitemap from './components/dashboard-sitemap/dashboard-sitemap.vue'
import { RichnessData } from './components/dashboard-top-taxons/dashboard-top-taxons'
import DashboardTopTaxons from './components/dashboard-top-taxons/dashboard-top-taxons.vue'
import { dashboardService } from './services'

export interface DashboardGeneratedData {
  metrics: Metrics
  endangered: DashboardSpecies[]
  highlighted: DashboardSpecies[]
  richness: RichnessData[]
}

export interface DashboardProfileData {
  description: string
  readme: string // markdown string
}

export interface DashboardSpecies {
  speciesId: string
  speciesSlug: string
  speciesName: string
  speciesCategory: string
  className: string
  thumbnailImageUrl: string
}

interface DataOption {
  label: string
  value: string
}

@Options({
  components: {
    DashboardEndangeredSpecies,
    DashboardHighlightedSpecies,
    DashboardLineChart,
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
  richness: RichnessData[] | null = null
  endangered: DashboardSpecies[] | null = null
  highlighted: DashboardSpecies[] | null = null
  selectedDataOption = 'speciesRichness'

  get dataOptions (): DataOption[] {
    return [
      {
        label: 'Species richness',
        value: 'speciesRichness'
      },
      {
        label: 'Detection frequency',
        value: 'detectionFrequency'
      }
    ]
  }

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
      const { endangered, highlighted, richness, metrics } = generated
      this.metrics = metrics
      this.endangered = endangered
      this.highlighted = highlighted
      this.richness = richness
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
