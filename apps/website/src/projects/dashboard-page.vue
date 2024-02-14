<template>
  <div class="bg-gray-50 dark:bg-pitch grid px-4 pl-18 default-scroll-start smooth">
    <section
      class="grid gap-y-20 mx-auto py-20 w-full max-w-screen-xl"
      :class="{'overflow-y-hidden h-screen': hasOpenedAnalysisSelector === true}"
    >
      <div class="text-gray-900 dark:text-white">
        <h1 class="text-5xl font-header font-normal <sm:text-2xl">
          {{ store.project?.name }}
        </h1>
      </div>
      <div class="text-gray-900 dark:text-white flex flex-col gap-y-6">
        <h2>
          Overview
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          <DashboardOverview
            v-for="stat in stats"
            :key="stat.value"
            :stat="stat"
          />
        </div>
      </div>
      <div class="text-gray-900 dark:text-white flex flex-col gap-y-6">
        <h2>
          Sites
        </h2>
        <div class="w-full text-black mapboxgl-map">
          <map-base-component
            :dataset="mapDataset()"
            data-key="refactorThis"
            :loading="false"
            :get-popup-html="getPopupHtml"
            map-export-name="dashboard-sites"
            :map-id="'dashboard-sites'"
            :map-initial-bounds="mapInitialBounds()"
            :map-base-formatter="circleFormatter()"
            :map-ground-style="mapGroundStyle"
            :map-statistics-style="mapStatisticsStyle"
            :is-show-labels="isShowLabels"
            :map-height="tabHeight"
            :style-non-zero="circleStyle()"
            class="map-bubble w-full"
          />
        </div>
      </div>
      <div class="text-gray-900 dark:text-white flex flex-col gap-y-6">
        <div class="flex items-center space-x-8">
          <h2>
            Analyses
          </h2>
          <button
            v-if="store.userIsFullProjectMember"
            class="btn block btn-primary flex text-xs items-center space-x-3 px-6 py-3 disabled:cursor-not-allowed disabled:btn-disabled disabled:hover:btn-disabled"
            type="button"
            :title="'Create New Analysis Job'"
            data-tooltip-target="analysesTooltipId"
            data-tooltip-placement="bottom"
            :disabled="!store.userIsFullProjectMember"
            @click="toggleAnalysisSelector(true)"
          >
            <icon-custom-ic-plus class="h-4 w-4 mb-3px" />
            <span class="font-display text-base">Create new analysis</span>
          </button>
          <div
            v-if="!store.userIsFullProjectMember"
            id="analysesTooltipId"
            role="tooltip"
            class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
          >
            {{ disableText }}
            <div
              class="tooltip-arrow"
              data-popper-arrow
            />
          </div>
          <CreateAnalysis
            v-if="hasOpenedAnalysisSelector"
            @emit-close="toggleAnalysisSelector(false)"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
          <DashboardAnalyses
            v-for="analysis in analyses"
            :key="analysis.value"
            :analysis="analysis"
          />
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initModals } from 'flowbite'
import { type LngLatBoundsLike } from 'mapbox-gl'
import { computed, inject, onMounted, ref, watch } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientArbimonLegacyKey, apiClientKey } from '@/globals'
import { useGetDashboardMetrics } from '@/insights/overview/composables/use-get-dashboard-metrics'
import { type MapboxGroundStyle, type MapboxStatisticsStyle, MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_SATELLITE_STREETS } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { type CircleStyle } from '~/maps/utils/circle-style/types'
import { useStore } from '~/store'
import { useAedJobCount, useClusteringJobCount, useClusteringSpeciesDetected } from './_composables/use-aed-count'
import { usePlaylistCount } from './_composables/use-playlist-count'
import { usePmSpeciesDetected, usePmTemplateCount } from './_composables/use-pm-count'
import { useBioProjectSitesRecordingCount } from './_composables/use-recording-count'
import { useRfmJobCount, useRfmSpeciesDetected } from './_composables/use-rfm-count'
import { useSoundscapeCount } from './_composables/use-soundscape-count'
import CreateAnalysis from './components/create-analysis.vue'
import DashboardAnalyses from './components/dashboard-analyses.vue'
import DashboardOverview from './components/dashboard-overview.vue'

const store = useStore()
const selectedProject = computed(() => store.project)
const selectedProjectId = computed(() => store.project?.id)
const selectedProjectSlug = computed(() => store.project?.slug)

const disableText = ref('Contact your project administrator for permission to manage analyses')

const apiClientBio = inject(apiClientKey) as AxiosInstance
const { isLoading: isLoadingMetrics, isError: isErrorMetrics, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)
const { isLoading: isLoadingSitesRecCountBio, data: projectSitesRecCount } = useBioProjectSitesRecordingCount(apiClientBio, selectedProjectId)

const BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const MAP_KEY_THAT_SHOULD_NOT_EXIST = 'refactorThis'
const isShowLabels = true
const mapGroundStyle: MapboxGroundStyle = MAPBOX_STYLE_SATELLITE_STREETS
const mapStatisticsStyle: MapboxStatisticsStyle = MAPBOX_STYLE_CIRCLE
const tabHeight = 360

// External data
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const { isLoading: isLoadingPlaylistCount, data: playlistCount } = usePlaylistCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingRFMCount, data: rfmCount } = useRfmJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSpDetected, data: rfmSpDetected } = useRfmSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingAedJobCount, data: aedJobCount } = useAedJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingClusteringJobCount, data: clusteringJobCount } = useClusteringJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingClusteringSpDetected, data: clusteringSpDetected } = useClusteringSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSoundscapeCount, data: soundscapeCount } = useSoundscapeCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPmtCount, data: pmSpeciesCount } = usePmSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPmTemplateCount, data: pmTemplateCount } = usePmTemplateCount(apiClientArbimon, selectedProjectSlug)

const stats = computed(() => [
  { value: 'site', title: 'Sites created', description: 'Number of sites with recordings', count: isErrorMetrics.value ? 0 : metrics.value?.totalSites, isLoading: isLoadingMetrics.value, label: 'Create new sites', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/sites` },
  { value: 'recording', title: 'Minutes of recordings', description: 'Total minutes of recordings captured', count: metrics.value?.totalRecordings ?? 0, isLoading: isLoadingMetrics.value, label: 'Upload new recordings', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/uploads/` },
  { value: 'playlist', title: 'Playlists created', description: 'Number of playlists created', count: playlistCount.value, isLoading: isLoadingPlaylistCount.value, label: 'Create new playlist', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/playlists` },
  { value: 'species', title: 'Species detected', description: 'Number of species detected', count: metrics.value?.totalSpecies ?? 0, isLoading: isLoadingMetrics.value, label: 'Add new species', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/species` }
])

const analyses = computed(() => [
  { value: 'pm', title: 'Pattern Matching', iconName: 'fi-pm', count: pmSpeciesCount.value, isLoading: isLoadingPmtCount.value || isLoadingPmTemplateCount.value, label: 'Templates', speciesTitle: 'Species analyzed', speciesDetected: pmTemplateCount.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/patternmatching` },
  { value: 'soundscapes', title: 'Soundscapes', iconName: 'fi-soundscape', count: soundscapeCount.value, isLoading: isLoadingSoundscapeCount.value, label: 'Soundscapes completed', link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/soundscapes` },
  { value: 'aed', title: 'AED & Clustering', iconName: 'fi-aed', count: (aedJobCount.value != null) ? aedJobCount.value : 0 + ((clusteringJobCount.value != null) ? clusteringJobCount.value : 0), isLoading: isLoadingAedJobCount.value || isLoadingClusteringJobCount.value || isLoadingClusteringSpDetected.value, label: 'Jobs completed', speciesTitle: 'Species detected', speciesDetected: clusteringSpDetected.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/audio-event-detections-clustering` },
  { value: 'rfm', title: 'Random Forest Models', iconName: 'fi-rfm', count: rfmCount.value, isLoading: isLoadingRFMCount.value || isLoadingSpDetected.value, label: 'Models completed', speciesTitle: 'Species analyzed', speciesDetected: rfmSpDetected.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/random-forest-models/models` }
])

const getPopupHtml = (data: MapSiteData, dataKey: string): string => `${data.values[dataKey]}`
const hasOpenedAnalysisSelector = ref(false)

function color (): string {
  return store.datasetColors[0] ?? '#EFEFEF'
}

function circleStyle (): CircleStyle {
  return { ...DEFAULT_NON_ZERO_STYLE, color: color() }
}

function mapDataset (): MapDataSet {
  return {
    startDate: dayjs(),
    endDate: dayjs(),
    sites: store.projectFilters?.locationSites ?? [],
    data: (store.projectFilters?.locationSites ?? [])
      .map(({ id, name: siteName, latitude, longitude }) => ({
        siteName: 'Site Name',
        isExpand: true,
        latitude,
        longitude,
        values: {
          [MAP_KEY_THAT_SHOULD_NOT_EXIST]: siteName,
          'Total recordings': findTotalRecordings(id),
          'Days with recordings': findDaysWithRecordings(id)
        }
      })),
    maxValues: { [MAP_KEY_THAT_SHOULD_NOT_EXIST]: 0 }
  }
}

function findTotalRecordings (id: number): number {
  if (!projectSitesRecCount.value) return 0
  const site = projectSitesRecCount.value.find(site => site.id === id)
  if (!site) return 0
  else return site.recordings
}

function findDaysWithRecordings (id: number): number {
  if (!projectSitesRecCount.value) return 0
  const site = projectSitesRecCount.value.find(site => site.id === id)
  if (!site) return 0
  else return site.days
}

function mapInitialBounds (): LngLatBoundsLike | undefined {
  const project = store.project
  if (!project) return undefined
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
}

function circleFormatter (): MapBaseFormatter {
  return new CircleFormatterNormalizedWithMin({ maxValueRaw: 2 })
}

function toggleAnalysisSelector (isOpened: boolean): void {
  hasOpenedAnalysisSelector.value = isOpened
}

onMounted(() => {
  initModals()
})

watch(() => isLoadingSitesRecCountBio.value, () => {
  mapDataset()
})

</script>
