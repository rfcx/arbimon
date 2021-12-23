import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { EXTINCTION_LABELS_AND_COLORS, getExtinctionRisk } from '@rfcx-bio/common/iucn'

import { TAXONOMY_COLORS } from '~/api/taxonomy-service'
import HorizontalStackedDistribution from '~/charts/horizontal-stacked-distribution/horizontal-stacked-distribution.vue'
import { RouteNames } from '~/router'
import { BiodiversityStore } from '~/store'
import { HighlightedSpeciesRow } from './components/dashboard-highlighted-species/dashboard-highlighted-species'
import DashboardHighlightedSpecies from './components/dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashboardLineChart from './components/dashboard-line-chart/dashboard-line-chart.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectProfile from './components/dashboard-project-profile/dashboard-project-profile.vue'
import DashboardSidebarTitle from './components/dashboard-sidebar-title/dashboard-sidebar-title.vue'
import DashboardSitemap from './components/dashboard-sitemap/dashboard-sitemap.vue'
import { ThreatenedSpeciesRow } from './components/dashboard-threatened-species/dashboard-threatened-species'
import DashboardThreatenedSpecies from './components/dashboard-threatened-species/dashboard-threatened-species.vue'
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
    DashboardHighlightedSpecies,
    DashboardLineChart,
    DashboardMetrics,
    DashboardProjectProfile,
    DashboardSidebarTitle,
    DashboardSitemap,
    DashboardThreatenedSpecies,
    HorizontalStackedDistribution
  }
})
export default class DashboardPage extends Vue {
  @Inject() readonly ROUTE_NAMES!: RouteNames
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
      ? this.generated?.richnessByHour ?? null
      : this.generated?.detectionFrequencyByHour ?? null
  }

  get speciesHighlighted (): HighlightedSpeciesRow[] {
    if (!this.generated) return []

    return this.generated.speciesHighlighted.map(({ speciesId, scientificName, commonName, speciesSlug, thumbnailImageUrl, extinctionRisk }) => ({
      speciesId,
      scientificName,
      commonName,
      speciesSlug,
      imageUrl: (thumbnailImageUrl && thumbnailImageUrl.length > 0) ? thumbnailImageUrl : new URL('../_assets/default-species-image.jpg', import.meta.url).toString(),
      extinctionRisk: getExtinctionRisk(extinctionRisk)
    }))
  }

  get speciesThreatened (): ThreatenedSpeciesRow[] {
    if (!this.generated) return []

    return this.generated.speciesThreatened.map(({ speciesId, scientificName, commonName, speciesSlug, thumbnailImageUrl, extinctionRisk }) => ({
      speciesId,
      scientificName,
      commonName,
      speciesSlug,
      imageUrl: (thumbnailImageUrl && thumbnailImageUrl.length > 0) ? thumbnailImageUrl : new URL('../_assets/default-species-image.jpg', import.meta.url).toString(),
      extinctionRisk: getExtinctionRisk(extinctionRisk)
    }))
  }

  get taxonColors (): Record<string, string> {
    return TAXONOMY_COLORS
  }

  get extinctionColors (): Record<string, string> {
    return EXTINCTION_LABELS_AND_COLORS
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
