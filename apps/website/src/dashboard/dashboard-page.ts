import { max } from 'lodash-es'
import { LngLatBoundsLike } from 'mapbox-gl'
import numeral from 'numeral'
import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { EXTINCTION_LABELS_AND_COLORS, getExtinctionRisk } from '@rfcx-bio/common/iucn'
import { TAXONOMY_COLORS } from '@rfcx-bio/common/mock-data/raw-taxon-classes'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { downloadSvgAsPng } from '~/charts'
import HorizontalStackedDistribution from '~/charts/horizontal-stacked-distribution/horizontal-stacked-distribution.vue'
import { generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { MapBubbleComponent, MapDataSet, MapSiteData } from '~/maps/map-bubble'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { CircleFormatter } from '~/maps/utils/circle-formatter/types'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/utils/circle-style/constants'
import { CircleStyle } from '~/maps/utils/circle-style/types'
import { RouteNames } from '~/router'
import { BiodiversityStore } from '~/store'
import { TIME_BUCKET_LABELS } from '~/time-buckets'
import { HighlightedSpeciesRow } from './components/dashboard-highlighted-species/dashboard-highlighted-species'
import DashboardHighlightedSpecies from './components/dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectProfile from './components/dashboard-project-profile/dashboard-project-profile.vue'
import DashboardSidebarTitle from './components/dashboard-sidebar-title/dashboard-sidebar-title.vue'
import { ThreatenedSpeciesRow } from './components/dashboard-threatened-species/dashboard-threatened-species'
import DashboardThreatenedSpecies from './components/dashboard-threatened-species/dashboard-threatened-species.vue'
import { dashboardService } from './services'

interface Tab {
  label: string
  value: string
}

const TAB_VALUES = {
  richness: 'speciesRichness',
  detections: 'detection'
}

const tabs: Tab[] = [
  { label: 'Species Richness', value: TAB_VALUES.richness },
  { label: 'Detections (raw)', value: TAB_VALUES.detections }
]

const MAP_KEY_THAT_SHOULD_NOT_EXIST = 'refactorThis'

@Options({
  components: {
    DashboardHighlightedSpecies,
    DashboardMetrics,
    DashboardProjectProfile,
    DashboardSidebarTitle,
    DashboardThreatenedSpecies,
    LineChartComponent,
    HorizontalStackedDistribution,
    MapBubbleComponent
  }
})
export default class DashboardPage extends Vue {
  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Inject() readonly store!: BiodiversityStore

  generated: DashboardGeneratedResponse | null = null
  profile: DashboardProfileResponse | null = null

  tabHeight = 360
  tabs = tabs
  selectedTab = tabs[0].value

  getPopupHtml = (data: MapSiteData, dataKey: string) => data.distinctSpecies[dataKey]

  get color (): string {
    return this.store.datasetColors[0] ?? '#EFEFEF'
  }

  get mapInitialBounds (): LngLatBoundsLike | null {
    const project = this.store.selectedProject
    if (!project) return null
    return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
  }

  get circleFormatter (): CircleFormatter {
    return new CircleFormatterNormalizedWithMin({ maxValueRaw: this.mapDataset.maxValues[MAP_KEY_THAT_SHOULD_NOT_EXIST] })
  }

  get circleStyle (): CircleStyle {
    return { ...DEFAULT_NON_ZERO_STYLE, color: this.color }
  }

  get lineChartData (): Record<number, number> | null {
    return this.selectedTab === TAB_VALUES.richness
      ? this.generated?.richnessByHour ?? null
      : this.generated?.detectionByHour ?? null
  }

  get lineChartSeries (): LineChartSeries[] {
    return this.lineChartData
      ? [{ color: this.color, data: this.lineChartData }]
      : []
  }

  get lineChartConfig (): Omit<LineChartConfig, 'width'> {
    return {
      height: this.tabHeight,
      margins: { top: 20, right: 10, bottom: 30, left: 40 },
      xTitle: TIME_BUCKET_LABELS.hourOfDay,
      yTitle: this.selectedTab === TAB_VALUES.richness ? 'Number of species' : 'Detections (Raw)',
      xBounds: [0, 23],
      yLabelFormatter: (n) => Number.isInteger(n) ? numeral(n).format('0,0') : ''
    }
  }

  get mapDataset (): MapDataSet {
    return {
      startDate: dayjs(),
      endDate: dayjs(),
      sites: this.store.sites,
      data: ((this.selectedTab === TAB_VALUES.richness ? this.generated?.richnessBySite : this.generated?.detectionBySite) ?? [])
        .map(({ name: siteName, latitude, longitude, value }) => ({
          siteName,
          latitude,
          longitude,
          distinctSpecies: {
            [MAP_KEY_THAT_SHOULD_NOT_EXIST]: value
          }
        })),
      maxValues: {
        [MAP_KEY_THAT_SHOULD_NOT_EXIST]: max(this.selectedTab === TAB_VALUES.richness
          ? this.generated?.richnessBySite.map(d => d.value)
          : this.generated?.detectionBySite.map(d => d.value)
        ) ?? 0
      }
    }
  }

  get speciesHighlighted (): HighlightedSpeciesRow[] {
    if (!this.profile) return []

    return this.profile.speciesHighlighted.map(({ speciesId, scientificName, commonName, speciesSlug, thumbnailImageUrl, extinctionRisk }) => ({
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
    if (projectId === undefined) return

    const [generated, profile] = await Promise.all([
      dashboardService.getDashboardGeneratedData(projectId),
      dashboardService.getDashboardProfileData(projectId)
    ])

    this.generated = generated ?? null
    this.profile = profile ?? null
  }

  async downloadLineChart (): Promise<void> {
    const margins = { ...this.lineChartConfig.margins, bottom: 80, left: 80 }
    const exportConfig = { ...this.lineChartConfig, margins, width: 1024, height: 576 }
    const svg = await generateChartExport(this.lineChartSeries, exportConfig)
    if (!svg) return

    await downloadSvgAsPng(svg, getExportGroupName(`dashboard-${this.selectedTab}-line-chart`))
  }
}
