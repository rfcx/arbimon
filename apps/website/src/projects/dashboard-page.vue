<template>
  <div class="default-scroll-start smooth">
    <div class="bg-gray-50 dark:bg-pitch grid px-4 pl-18">
      <section
        class="grid gap-y-20 mx-auto py-20 w-full max-w-screen-xl"
        :class="{'overflow-y-hidden h-screen': hasOpenedAnalysisSelector === true}"
      >
        <div class="text-gray-900 dark:text-white w-full overflow-hidden">
          <h1
            class="text-5xl w-full font-header font-normal <sm:text-2xl truncate max-w-full overflow-hidden whitespace-nowrap"
            :title="store.project?.name"
          >
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
          <div
            v-if="isLoadingSitesRecCountBio"
            class="w-full bg-util-gray-03 loading-shimmer h-90"
          />
          <div
            v-else
            class="w-full text-black mapboxgl-map z-10"
          >
            <map-base-component
              :dataset="mapDataset()"
              :data-key="MAP_KEY"
              :loading="false"
              :get-popup-html="getPopupHtml"
              map-export-name="dashboard-sites"
              :map-id="'dashboard-sites'"
              :map-initial-bounds="mapInitialBounds()"
              :map-base-formatter="circleFormatter"
              :map-ground-style="mapGroundStyle"
              :map-statistics-style="mapStatisticsStyle"
              :is-show-labels="isShowLabels"
              :map-height="tabHeight"
              :style-non-zero="circleStyle"
              class="map-bubble w-full"
            />
          </div>
          <div class="flex flex-row justify-between mt-4">
            <circle-legend
              v-if="mapStatisticsStyle === MAPBOX_STYLE_CIRCLE && !isLoadingSitesRecCountBio"
              :map-base-formatter="circleFormatter"
              :style-non-zero="circleStyle"
              :is-integer-label="true"
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
              :data-tooltip-target="!store.userIsFullProjectMember ? `analysesTooltipId` : null"
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
  </div>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initModals } from 'flowbite'
import { type LngLatBoundsLike } from 'mapbox-gl'
import type { ComputedRef } from 'vue'
import { computed, inject, onMounted, ref, watch } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientArbimonLegacyKey, apiClientKey } from '@/globals'
import { type MapboxGroundStyle, type MapboxStatisticsStyle, MAPBOX_STYLE_CIRCLE, MAPBOX_STYLE_SATELLITE_STREETS } from '~/maps'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import CircleLegend from '~/maps/map-legend/circle-legend.vue'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { useStore } from '~/store'
import { useAedJobCount, useClusteringJobCount, useClusteringSpeciesDetected } from './_composables/use-aed-count'
import { usePlaylistCount } from './_composables/use-playlist-count'
import { usePmSpeciesDetected, usePmTemplateCount } from './_composables/use-pm-count'
import { useBioProjectSitesRecordingCount, useRecordingCount } from './_composables/use-recording-count'
import { useRfmJobCount, useRfmSpeciesDetected } from './_composables/use-rfm-count'
import { useSiteCount } from './_composables/use-site-count'
import { useSoundscapeCount } from './_composables/use-soundscape-count'
import { useSpeciesCount } from './_composables/use-species-count'
import CreateAnalysis from './components/create-analysis.vue'
import DashboardAnalyses from './components/dashboard-analyses.vue'
import DashboardOverview from './components/dashboard-overview.vue'

const store = useStore()
const selectedProject = computed(() => store.project)
const selectedProjectId = computed(() => store.project?.id)
const selectedProjectSlug = computed(() => store.project?.slug)

const disableText = ref('Contact your project administrator for permission to manage analyses')

const apiClientBio = inject(apiClientKey) as AxiosInstance
const { isLoading: isLoadingSitesRecCountBio, data: projectSitesRecCount } = useBioProjectSitesRecordingCount(apiClientBio, selectedProjectId)

const BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const MAP_KEY = 'total_recordings_per_site'
const isShowLabels = true
const mapGroundStyle: MapboxGroundStyle = MAPBOX_STYLE_SATELLITE_STREETS
const mapStatisticsStyle: MapboxStatisticsStyle = MAPBOX_STYLE_CIRCLE
const tabHeight = 360

// External data
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const { isLoading: isLoadingSiteCount, data: siteCount } = useSiteCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSpeciesCount, data: speciesCount } = useSpeciesCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingRecordingCount, data: recordingCount } = useRecordingCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPlaylistCount, data: playlistCount } = usePlaylistCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingRFMCount, data: rfmCount, isError: rfmCountError } = useRfmJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSpDetected, data: rfmSpDetected, isError: rfmSpDetectedError } = useRfmSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingAedJobCount, data: aedJobCount, isError: aedJobCountError } = useAedJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingClusteringJobCount, data: clusteringJobCount } = useClusteringJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingClusteringSpDetected, data: clusteringSpDetected, isError: clusteringSpDetectedError } = useClusteringSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSoundscapeCount, data: soundscapeCount, isError: soundscapeCountError } = useSoundscapeCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPmtCount, data: pmSpeciesCount, isError: pmSpeciesError } = usePmSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPmTemplateCount, data: pmTemplateCount, isError: pmTemplateError } = usePmTemplateCount(apiClientArbimon, selectedProjectSlug)

const stats = computed(() => [
  { value: 'site', title: 'Sites created', description: 'Total sites created', count: siteCount.value, isLoading: isLoadingSiteCount.value, label: 'Create new sites', link: `${BASE_URL}/p/${selectedProject.value?.slug}/audiodata/sites` },
  { value: 'recording', title: 'Recordings uploaded', description: 'Total number of audio files uploaded', count: recordingCount.value, isLoading: isLoadingRecordingCount.value, label: 'Upload new recordings', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/uploads/` },
  { value: 'playlist', title: 'Playlists created', description: 'Number of playlists created', count: playlistCount.value, isLoading: isLoadingPlaylistCount.value, label: 'Create new playlist', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/playlists` },
  { value: 'species', title: 'Species added', description: 'Total species added to the project', count: speciesCount.value, isLoading: isLoadingSpeciesCount.value, label: 'Add new species', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/species` }
])

const analyses = computed(() => [
  { value: 'pm', title: 'Pattern Matching', iconName: 'fi-pm', count: pmSpeciesCount.value, isLoading: isLoadingPmtCount.value || isLoadingPmTemplateCount.value, label: 'Templates', speciesTitle: 'Species analyzed', speciesDetected: pmTemplateCount.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/patternmatching`, error: pmSpeciesError.value, speciesDetectedError: pmTemplateError.value },
  { value: 'soundscapes', title: 'Soundscapes', iconName: 'fi-soundscape', count: soundscapeCount.value, isLoading: isLoadingSoundscapeCount.value, label: 'Soundscapes completed', link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/soundscapes`, error: soundscapeCountError.value },
  { value: 'aed', title: 'AED & Clustering', iconName: 'fi-aed', count: (aedJobCount.value != null) ? aedJobCount.value : 0 + ((clusteringJobCount.value != null) ? clusteringJobCount.value : 0), isLoading: isLoadingAedJobCount.value || isLoadingClusteringJobCount.value || isLoadingClusteringSpDetected.value, label: 'Jobs completed', speciesTitle: 'Species detected', speciesDetected: clusteringSpDetected.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/audio-event-detections-clustering`, error: aedJobCountError.value, speciesDetectedError: clusteringSpDetectedError.value },
  { value: 'rfm', title: 'Random Forest Models', iconName: 'fi-rfm', count: rfmCount.value, isLoading: isLoadingRFMCount.value || isLoadingSpDetected.value, label: 'Models completed', speciesTitle: 'Species analyzed', speciesDetected: rfmSpDetected.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/random-forest-models/models`, error: rfmCountError.value, speciesDetectedError: rfmSpDetectedError.value }
])

const getPopupHtml = (data: MapSiteData, dataKey: string): string => {
  return `<div class="font-sans"><strong>Site name: </strong>${data.siteName} <br>
    <strong>Total recordings: </strong>${data.values[`${dataKey}`]} <br>
    <strong>Days with recordings: </strong>${data.values['Days with recordings']}</div>
  `
}
const hasOpenedAnalysisSelector = ref(false)

const circleStyle = computed(() => {
  const color = store.datasetColors[0] ?? '#EFEFEF'
  return { ...DEFAULT_NON_ZERO_STYLE, color }
})

function mapDataset (): MapDataSet {
  return {
    startDate: dayjs(),
    endDate: dayjs(),
    sites: store.projectFilters?.locationSites ?? [],
    data: (store.projectFilters?.locationSites ?? [])
      .map(({ id, name: siteName, latitude, longitude }) => ({
        siteName,
        isExpand: true,
        latitude,
        longitude,
        values: {
          [MAP_KEY]: findTotalRecordings(id),
          'Days with recordings': findDaysWithRecordings(id)
        }
      })),
    maxValues: { [MAP_KEY]: maxRecordings.value }
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

const maxRecordings = computed(() => projectSitesRecCount.value?.map(site => site.recordings).reduce((acc, curr) => Math.max(acc, curr), 0) ?? 0)

function mapInitialBounds (): LngLatBoundsLike | undefined {
  const project = store.project
  if (project === undefined) return undefined
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
}

const circleFormatter: ComputedRef<MapBaseFormatter> = computed(() => {
  return new CircleFormatterNormalizedWithMin({ maxValueRaw: mapDataset().maxValues[MAP_KEY], showZeroInLegend: true })
})

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
