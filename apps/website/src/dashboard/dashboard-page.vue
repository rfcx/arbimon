<template>
  <div v-if="store.selectedProject">
    <div v-if="store.projectData.value.isLoading" />
    <div v-else>
      <draft-banner
        v-if="lastUpdatedAt"
        current-mode="Draft"
        :sync-updated="lastUpdatedAt"
        :project-slug="store.selectedProject?.slug"
      />
    </div>
    <div class="dashboard-wrapper">
      <div class="dashboard-metric">
        <dashboard-metrics
          v-if="generated"
          :metrics="generated"
        />
      </div>
      <div class="dashboard-species">
        <div class="dashboard-richness">
          <dashboard-sidebar-title
            title="Species highlights"
            :route="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug } }"
          />
          <horizontal-stacked-distribution
            :dataset="richnessByTaxon"
            :known-total-count="generated?.speciesCount ?? 0"
            class="mt-4"
          />
          <dashboard-highlighted-species
            :species="speciesHighlighted"
            class="mt-5"
          />
        </div>
        <div class="threatened-species">
          <dashboard-sidebar-title
            title="Threatened species"
            :route="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug } }"
            class="mt-5 sm:mt-0 lg:mt-5"
          />
          <horizontal-stacked-distribution
            :dataset="richnessByRisk"
            :known-total-count="generated?.speciesCount ?? 0"
            class="mt-4"
          />
          <dashboard-threatened-species
            :species="speciesThreatened"
            class="mt-5"
          />
        </div>
      </div>
      <div class="dashboard-graphic">
        <div class="graphic-tabs">
          <p
            v-for="tab in tabs"
            :key="'dashboard-data-display-' + tab.value"
            class="text-lg capitalize py-2 px-4 cursor-pointer"
            :class="tab.value === selectedTab ? 'border-b-4 border-brand-primary' : 'border-b-1 border-steel-grey'"
            @click="selectedTab = tab.value"
          >
            {{ tab.label }}
          </p>
        </div>
        <div class="dashboard-graphic-content inline-grid w-full gap-2 mt-2 xl:grid-cols-2">
          <map-bubble-component
            :dataset="mapDataset"
            data-key="refactorThis"
            :get-popup-html="getPopupHtml"
            map-export-name="dashboard-map"
            :map-id="`dashboard-by-site`"
            :map-initial-bounds="mapInitialBounds"
            :circle-formatter="circleFormatter"
            :map-height="tabHeight"
            :circle-style-non-zero="circleStyle"
            class="map-bubble w-full"
          />
          <div class="line-chart relative">
            <line-chart-component
              dom-id="dashboard-line-chart"
              :config="lineChartConfig"
              :datasets="lineChartSeries"
            />
            <export-button
              v-if="hasLineChartData"
              class="absolute top-2 right-2"
              @click="downloadLineChart"
            />
          </div>
        </div>
      </div>
      <div class="dashboard-content">
        <page-title
          class="dashboard-title mt-5"
          :page-title="store.selectedProject.name"
          :page-subtitle="profile?.summary"
        />
        <dashboard-project-profile
          v-if="profile?.readme"
          :information="profile?.readme"
          class="mt-5"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { max } from 'lodash-es'
import { LngLatBoundsLike } from 'mapbox-gl'
import numeral from 'numeral'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { downloadSvgAsPng } from '~/charts'
import { HorizontalStack } from '~/charts/horizontal-stacked-distribution/horizontal-stacked-distribution'
import HorizontalStackedDistribution from '~/charts/horizontal-stacked-distribution/horizontal-stacked-distribution.vue'
import { generateChartExport, LineChartComponent, LineChartConfig, LineChartSeries } from '~/charts/line-chart'
import { getExportGroupName } from '~/filters'
import { MapBubbleComponent, MapDataSet, MapSiteData } from '~/maps/map-bubble'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { CircleFormatter } from '~/maps/utils/circle-formatter/types'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/utils/circle-style/constants'
import { CircleStyle } from '~/maps/utils/circle-style/types'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { RouteNames } from '~/router'
import { useStore } from '~/store'
import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'
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

const store = useStore()
const route = useRoute()

const ROUTE_NAMES = inject<RouteNames>('ROUTE_NAMES') as RouteNames

const MAP_KEY_THAT_SHOULD_NOT_EXIST = 'refactorThis'
const tabHeight = 360
const TAB_VALUES = {
  richness: 'speciesRichness',
  detections: 'detection'
}
const tabs: Tab[] = [
  { label: 'Species Richness', value: TAB_VALUES.richness },
  { label: 'Detections (raw)', value: TAB_VALUES.detections }
]

// TODO: Different default photos per taxon
const getDefaultPhoto = (taxonSlug: string): string =>
  new URL('../_assets/default-species-image.jpg', import.meta.url).toString()

const generated = ref<DashboardGeneratedResponse | null>(null)
const profile = ref<DashboardProfileResponse | null>(null)
const selectedTab = ref<string>(tabs[0].value)

watch(() => route.params.projectSlug, async (toProjectSlug, fromProjectSlug) => {
  if (toProjectSlug !== fromProjectSlug) {
    await updatePage()
  }
})

onMounted(async () => {
  await updatePage()
})

const getPopupHtml = (data: MapSiteData, dataKey: string) => data.distinctSpecies[dataKey]

const lastUpdatedAt = computed(() => store.projectData.value.data?.updatedList[0]?.updatedAt ?? null)

const color = computed(() => {
  return store.datasetColors[0] ?? '#EFEFEF'
})

const mapInitialBounds = computed((): LngLatBoundsLike | null => {
  const project = store.selectedProject
  if (!project) return null
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
})

const circleFormatter = computed((): CircleFormatter => {
    return new CircleFormatterNormalizedWithMin({ maxValueRaw: mapDataset.value.maxValues[MAP_KEY_THAT_SHOULD_NOT_EXIST] })
  })

const circleStyle = computed((): CircleStyle => {
  return { ...DEFAULT_NON_ZERO_STYLE, color: color.value }
})

const hasLineChartData = computed((): boolean => {
  return !lineChartData.value || Object.keys(lineChartData).length > 0
})

const lineChartData = computed((): Record<number, number> | null => {
  return selectedTab.value === TAB_VALUES.richness
    ? generated.value?.richnessByHour ?? null
    : generated.value?.detectionByHour ?? null
})

const lineChartSeries = computed((): LineChartSeries[] => {
  return lineChartData.value
    ? [{ color: color.value, data: lineChartData.value }]
    : []
})

const lineChartConfig = computed((): Omit<LineChartConfig, 'width'> => {
  return {
    height: tabHeight,
    margins: { top: 20, right: 10, bottom: 30, left: 40 },
    xTitle: TIME_BUCKET_LABELS.hourOfDay,
    yTitle: selectedTab.value === TAB_VALUES.richness ? 'Number of species' : 'Detections (Raw)',
    xBounds: [0, 23],
    yLabelFormatter: (n) => Number.isInteger(n) ? numeral(n).format('0,0') : ''
  }
})

const mapDataset = computed((): MapDataSet => {
    return {
    startDate: dayjs(),
    endDate: dayjs(),
    sites: store.projectFilters?.locationSites ?? [],
    data: ((selectedTab.value === TAB_VALUES.richness ? generated.value?.richnessBySite : generated.value?.detectionBySite) ?? [])
      .map(({ name: siteName, latitude, longitude, value }) => ({
        siteName,
        latitude,
        longitude,
        distinctSpecies: {
          [MAP_KEY_THAT_SHOULD_NOT_EXIST]: value
        }
      })),
    maxValues: {
      [MAP_KEY_THAT_SHOULD_NOT_EXIST]: max(selectedTab.value === TAB_VALUES.richness
        ? generated.value?.richnessBySite.map(d => d.value)
        : generated.value?.detectionBySite.map(d => d.value)
      ) ?? 0
    }
  }
})

const speciesHighlighted = computed((): HighlightedSpeciesRow[] => {
  if (!profile.value) return []

  return profile.value.speciesHighlighted.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => ({
    slug,
    taxonSlug,
    scientificName,
    commonName: commonName,
    photoUrl: photoUrl ?? getDefaultPhoto(taxonSlug),
    riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
  }))
})

const speciesThreatened = computed((): ThreatenedSpeciesRow[] => {
  if (!generated.value) return []

  return generated.value.speciesThreatened.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => ({
    slug,
    taxonSlug,
    scientificName,
    commonName: commonName,
    photoUrl: photoUrl ?? getDefaultPhoto(taxonSlug),
    riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
  }))
})

const richnessByTaxon = computed((): HorizontalStack[] => {
  if (store.projectData.value.isNoData) return []

  return (generated.value?.richnessByTaxon ?? [])
    .map(([taxonId, count]) => {
      const name = store.projectData.value.data?.taxonClasses.find(tc => tc.id === taxonId)?.commonName ?? '-'
      const color = TAXON_CLASSES_BY_ID[taxonId].color
      return { name, color, count }
    })
})

const richnessByRisk = computed((): HorizontalStack[] => {
  return (generated.value?.richnessByRisk ?? [])
    .map(([taxonId, count]) => {
      const taxonClass = RISKS_BY_ID[taxonId]
      return { name: taxonClass.label, color: taxonClass.color, count }
    })
})

const updatePage = async () => {
  const projectId = store.selectedProject?.id
  if (projectId === undefined) return

  const [gn, pf] = await Promise.all([
    dashboardService.getDashboardGeneratedData(projectId),
    dashboardService.getDashboardProfileData(projectId)
  ])

  generated.value = gn ?? null
  profile.value = pf ?? null
}

const downloadLineChart = async (): Promise<void> => {
  const margins = { ...lineChartConfig.value.margins, bottom: 80, left: 80 }
  const exportConfig = { ...lineChartConfig.value, margins, width: 1024, height: 576 }
  const svg = await generateChartExport(lineChartSeries.value, exportConfig)
  if (!svg) return

  await downloadSvgAsPng(svg, getExportGroupName(`dashboard-${selectedTab.value}-line-chart`))
}

</script>
<style src="./dashboard-page.scss" lang="scss"></style>
