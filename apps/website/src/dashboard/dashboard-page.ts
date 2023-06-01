import { type AxiosInstance } from 'axios'
import { max } from 'lodash-es'
import { type LngLatBoundsLike } from 'mapbox-gl'
import numeral from 'numeral'
import { Options, Vue } from 'vue-class-component'
import { Inject, Watch } from 'vue-property-decorator'
import { type RouteLocationNormalized } from 'vue-router'

import { type ApiLine, type ApiMap, type ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { type DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientBioKey, routeNamesKey, storeKey } from '@/globals'
import { downloadSvgAsPng } from '~/charts'
import { type HorizontalStack } from '~/charts/horizontal-stacked-distribution/horizontal-stacked-distribution'
import HorizontalStackedDistribution from '~/charts/horizontal-stacked-distribution/horizontal-stacked-distribution.vue'
import { type LineChartConfig, type LineChartSeries, generateChartExport, LineChartComponent } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { type CircleStyle } from '~/maps/utils/circle-style/types'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { type RouteNames } from '~/router'
import { type BiodiversityStore } from '~/store'
import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'
import { TIME_BUCKET_LABELS } from '~/time-buckets'
import { type HighlightedSpeciesRow } from './components/dashboard-highlighted-species/dashboard-highlighted-species'
import DashboardHighlightedSpecies from './components/dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectProfile from './components/dashboard-project-profile/dashboard-project-profile.vue'
import DashboardSidebarTitle from './components/dashboard-sidebar-title/dashboard-sidebar-title.vue'
import { type ThreatenedSpeciesRow } from './components/dashboard-threatened-species/dashboard-threatened-species'
import DashboardThreatenedSpecies from './components/dashboard-threatened-species/dashboard-threatened-species.vue'

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

// TODO: Different default photos per taxon
const getDefaultPhoto = (taxonSlug: string): string =>
  new URL('../_assets/default-species-image.jpg', import.meta.url).toString()

interface Metrics {
  detectionMinutesCount: number
  siteCount: number
  speciesCount: number
  speciesThreatenedCount: number
  maxDate?: Date
  minDate?: Date
}

@Options({
  components: {
    DashboardHighlightedSpecies,
    DashboardMetrics,
    DashboardProjectProfile,
    DashboardSidebarTitle,
    DashboardThreatenedSpecies,
    LineChartComponent,
    HorizontalStackedDistribution,
    MapBaseComponent
  }
})
export default class DashboardPage extends Vue {
  @Inject({ from: apiClientBioKey }) readonly apiClientBio!: AxiosInstance
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  // new api calls for testing
  metrics: Metrics | null = null
  content: { summary: string, readme: string } | null = null
  richnesses: { richnessByTaxon: ApiStack, richnessByRisk: ApiStack } | null = null
  map: { richnessBySite: ApiMap, detectionBySite: ApiMap } | null = null
  byHour: { richnessByHour: ApiLine, detectionByHour: ApiLine } | null = null
  threatened: { speciesThreatened: DashboardSpecies[] } | null = null
  highlighted: { speciesHighlighted: DashboardSpecies[] } | null = null

  tabHeight = 360
  tabs = tabs
  selectedTab = tabs[0].value

  getPopupHtml = (data: MapSiteData, dataKey: string): number | boolean => data.values[dataKey]

  get color (): string {
    return this.store.datasetColors[0] ?? '#EFEFEF'
  }

  get mapInitialBounds (): LngLatBoundsLike | null {
    const project = this.store.selectedProject
    if (!project) return null
    return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
  }

  get circleFormatter (): MapBaseFormatter {
    return new CircleFormatterNormalizedWithMin({ maxValueRaw: this.mapDataset.maxValues[MAP_KEY_THAT_SHOULD_NOT_EXIST] })
  }

  get circleStyle (): CircleStyle {
    return { ...DEFAULT_NON_ZERO_STYLE, color: this.color }
  }

  get hasLineChartData (): boolean {
    return !this.lineChartData || Object.keys(this.lineChartData).length > 0
  }

  get lineChartData (): Record<number, number> | null {
    return this.selectedTab === TAB_VALUES.richness
      ? this.byHour?.richnessByHour ?? null
      : this.byHour?.detectionByHour ?? null
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
      sites: this.store.projectFilters?.locationSites ?? [],
      data: ((this.selectedTab === TAB_VALUES.richness ? this.map?.richnessBySite : this.map?.detectionBySite) ?? [])
        .map(({ name: siteName, latitude, longitude, value }) => ({
          siteName,
          latitude,
          longitude,
          values: {
            [MAP_KEY_THAT_SHOULD_NOT_EXIST]: value
          }
        })),
      maxValues: {
        [MAP_KEY_THAT_SHOULD_NOT_EXIST]: max(this.selectedTab === TAB_VALUES.richness
          ? this.map?.richnessBySite.map(d => d.value)
          : this.map?.detectionBySite.map(d => d.value)
        ) ?? 0
      }
    }
  }

  get speciesHighlighted (): HighlightedSpeciesRow[] {
    if (!this.highlighted) return []

    return this.highlighted.speciesHighlighted.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => ({
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? getDefaultPhoto(taxonSlug),
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    }))
  }

  get speciesThreatened (): ThreatenedSpeciesRow[] {
    if (!this.threatened) return []

    return this.threatened.speciesThreatened.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => ({
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? getDefaultPhoto(taxonSlug),
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    }))
  }

  get richnessByTaxon (): HorizontalStack[] {
    return (this.richnesses?.richnessByTaxon ?? [])
      .map(([taxonId, count]) => {
        const name = this.store.projectFilters?.taxonClasses.find(tc => tc.id === taxonId)?.commonName ?? '-'
        const color = TAXON_CLASSES_BY_ID[taxonId].color
        return { name, color, count }
      })
  }

  get richnessByRisk (): HorizontalStack[] {
    return (this.richnesses?.richnessByRisk ?? [])
      .map(([taxonId, count]) => {
        const taxonClass = RISKS_BY_ID[taxonId]
        return { name: taxonClass.label, color: taxonClass.color, count }
      })
  }

  override async created (): Promise<void> {
    await this.updatePage()
  }

  @Watch('$route')
  async onRouterChange (to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<void> {
    if (to.params.projectSlug !== from.params.projectSlug) {
      await this.updatePage()
    }
  }

  async updatePage (): Promise<void> {
    const projectId = this.store.selectedProject?.id
    if (projectId === undefined) return

    const c = await this.apiClientBio.get<{ summary: string, readme: string }>(`/projects/${projectId}/dashboard-profile/content`)
    this.content = c.data ?? null

    const r = await this.apiClientBio.get<{ richnessByTaxon: ApiStack, richnessByRisk: ApiStack }>(`/projects/${projectId}/dashboard-generated/sidebar`)
    this.richnesses = r.data ?? null

    const [mapApi, b, h] = await Promise.all([
      this.apiClientBio.get<{ richnessBySite: ApiMap, detectionBySite: ApiMap }>(`/projects/${projectId}/dashboard-generated/map-dataset`),
      this.apiClientBio.get<{ richnessByHour: ApiLine, detectionByHour: ApiLine }>(`/projects/${projectId}/dashboard-generated/richness-by-hour`),
      this.apiClientBio.get<{ speciesHighlighted: DashboardSpecies[] }>(`/projects/${projectId}/dashboard-generated/species-highlighted`)
    ])

    this.byHour = b.data ?? null
    this.highlighted = h.data ?? null

    const m = await this.apiClientBio.get<Metrics>(`/projects/${projectId}/dashboard-generated/project-metrics`)
    this.metrics = m.data ?? null

    const t = await this.apiClientBio.get<{ speciesThreatened: DashboardSpecies[] }>(`/projects/${projectId}/dashboard-generated/species-threatened`)
    this.threatened = t.data ?? null

    this.map = mapApi.data ?? null
  }

  async downloadLineChart (): Promise<void> {
    const margins = { ...this.lineChartConfig.margins, bottom: 80, left: 80 }
    const exportConfig = { ...this.lineChartConfig, margins, width: 1024, height: 576 }
    const svg = generateChartExport(this.lineChartSeries, exportConfig)
    if (!svg) return

    await downloadSvgAsPng(svg, getExportGroupName(`dashboard-${this.selectedTab}-line-chart`))
  }
}
