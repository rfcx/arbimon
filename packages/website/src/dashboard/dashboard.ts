import { Options, Vue } from 'vue-class-component'
import { Inject, Watch } from 'vue-property-decorator'

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
  speciesRichness: DashboardDisplayData
  detectionFrequency: DashboardDisplayData
  richness: RichnessData[]
  endangered: DashboardSpecies[]
  highlighted: DashboardSpecies[]
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

export interface DataOption {
  label: string
  value: string
}

export interface DashboardDisplayData {
  time: Record<number, number>
}

const OPTION_VALUES = {
  richness: 'speciesRichness',
  frequency: 'detectionFrequency'
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

  speciesRichness: DashboardDisplayData | null = null
  detectionFrequency: DashboardDisplayData | null = null
  timeData: Record<number, number> | null = null
  selectedDataOption = OPTION_VALUES.richness

  get dataOptions (): DataOption[] {
    return [
      {
        label: 'Species richness',
        value: OPTION_VALUES.richness
      },
      {
        label: 'Detection frequency',
        value: OPTION_VALUES.frequency
      }
    ]
  }

  override async mounted (): Promise<void> {
    await this.getData()
    this.onSelectedDataOptionChange()
  }

  @Watch('selectedDataOption')
  onSelectedDataOptionChange (): void {
    this.timeData = this.selectedDataOption === OPTION_VALUES.richness ? this.speciesRichness?.time ?? null : this.detectionFrequency?.time ?? null
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
      const { speciesRichness, detectionFrequency, richness, endangered, highlighted, metrics } = generated
      this.metrics = metrics
      this.speciesRichness = speciesRichness
      this.detectionFrequency = detectionFrequency
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
