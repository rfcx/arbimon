import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio-types/dashboard-generated'
import { DashboardProfileResponse } from '@rfcx-bio/common/api-bio-types/dashboard-profile'
import { getExtinctionRisk } from '@rfcx-bio/common/iucn'

import { BiodiversityStore } from '~/store'
import { EndangeredSpeciesRow } from './components/dashboard-endangered-species/dashboard-endangered-species'
import DashboardEndangeredSpecies from './components/dashboard-endangered-species/dashboard-endangered-species.vue'
import { HighlightedSpeciesRow } from './components/dashboard-highlighted-species/dashboard-highlighted-species'
import DashboardHighlightedSpecies from './components/dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashboardLineChart from './components/dashboard-line-chart/dashboard-line-chart.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectProfile from './components/dashboard-project-profile/dashboard-project-profile.vue'
import DashboardSitemap from './components/dashboard-sitemap/dashboard-sitemap.vue'
import DashboardTopTaxons from './components/dashboard-top-taxons/dashboard-top-taxons.vue'
import { dashboardService } from './services'

export interface Tab {
  label: string
  value: string
}

const TAB_VALUES = {
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

  generated: DashboardGeneratedResponse | null = null
  profile: DashboardProfileResponse | null = null

  selectedTab = TAB_VALUES.richness
  tabs = [
    { label: 'Species Richness', value: TAB_VALUES.richness },
    { label: 'Detection Frequency', value: TAB_VALUES.frequency }
  ]

  get lineChartData (): Record<number, number> | null {
    return this.selectedTab === TAB_VALUES.richness
      ? this.generated?.speciesRichness?.time ?? null
      : this.generated?.detectionFrequency?.time ?? null
  }

  get highlighted (): HighlightedSpeciesRow[] {
    if (!this.generated) return []

    return this.generated.highlighted.map(({ speciesId, speciesName, speciesSlug, thumbnailImageUrl, extinctionRisk }) => ({
      speciesId,
      speciesName,
      speciesSlug,
      imageUrl: thumbnailImageUrl ?? new URL('../_assets/default-species-image.jpg', import.meta.url).toString(),
      extinctionRisk: getExtinctionRisk(extinctionRisk)
    }))
  }

  get endangered (): EndangeredSpeciesRow[] {
    if (!this.generated) return []

    return this.generated.endangered.map(({ speciesId, speciesName, speciesSlug, thumbnailImageUrl, extinctionRisk }) => ({
      speciesId,
      speciesName,
      speciesSlug,
      imageUrl: thumbnailImageUrl ?? new URL('../_assets/default-species-image.jpg', import.meta.url).toString(),
      extinctionRisk: getExtinctionRisk(extinctionRisk)
    }))
  }

  override async created (): Promise<void> {
    const projectId = this.store.selectedProject?.id
    if (!projectId) return

    const [generated, profile] = await Promise.all([
      dashboardService.getDashboardGeneratedData(projectId),
      dashboardService.getDashboardProfileData(projectId)
    ])

    this.generated = generated ?? null
    this.profile = profile ?? null
  }
}
