<template>
  <section class="max-w-screen-xl mx-auto px-2 sm:px-8 pb-8">
    <div class="text-gray-900 dark:text-white">
      <h1 class="text-4xl pt-16 pb-1 font-bold">
        {{ store.selectedProject?.name }}
      </h1>
    </div>
    <div class="text-gray-900 dark:text-white">
      <h2 class="text-3xl pt-8 pb-6">
        Overview
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <DashboardOverview
          v-for="stat in stats"
          :key="stat.value"
          :stat="stat"
        />
      </div>
    </div>
    <div class="text-gray-900 dark:text-white">
      <div class="flex items-center space-x-6">
        <h2 class="text-3xl pt-8 pb-6">
          Analyses
        </h2>
        <a
          class="btn btn-icon flex items-center space-x-3 px-3 py-2 text-xs font-bold rounded-lg bg-gray-500"
          :title="'Create New Analysis Job'"
          :href="ANALYSIS_URL"
          target="_blank"
        >
          <span sclass="sm:hidden">Create new Analysis</span>
          <icon-fa-plus class="h-3 w-3" />
        </a>
        <button :title="'Create New Analysis Job'">
          <icon-fas-info-circle
            class="h-4 w-4 mr-2 text-gray-300 cursor-pointer"
          />
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-4">
        <DashboardAnalyses
          v-for="analysis in analyses"
          :key="analysis.value"
          :analysis="analysis"
        />
      </div>
      <div class="text-gray-900 dark:text-white">
        <h2 class="text-3xl pt-8 pb-6">
          Sites
        </h2>
        <div class="w-full text-black mapboxgl-map">
          <map-base-component
            :dataset="mapDataset()"
            data-key="refactorThis"
            :loading="false"
            :get-popup-html="getPopupHtml"
            map-export-name="dashboard-sites"
            :map-id="`dashboard-sites`"
            :map-initial-bounds="mapInitialBounds()"
            :map-base-formatter="circleFormatter()"
            :map-height="tabHeight"
            :style-non-zero="circleStyle()"
            class="map-bubble w-full"
          />
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { type LngLatBoundsLike } from 'mapbox-gl'
import { computed, inject } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientArbimonKey } from '@/globals'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { type CircleStyle } from '~/maps/utils/circle-style/types'
import { useStore } from '~/store'
import { useAedCount } from './_composables/use-aed-count'
import { usePlaylistCount } from './_composables/use-playlist-count'
import { usePmCount } from './_composables/use-pm-count'
import { useRecordingCount } from './_composables/use-recording-count'
import { useRfmCount } from './_composables/use-rfm-count'
import { useSiteCount } from './_composables/use-site-count'
import { useSoundscapeCount } from './_composables/use-soundscape-count'
import { useSpeciesCount } from './_composables/use-species-count'
import DashboardAnalyses from './components/dashboard-analyses.vue'
import DashboardOverview from './components/dashboard-overview.vue'

const store = useStore()
const selectedProject = computed(() => store.selectedProject)
const selectedProjectSlug = computed(() => store.selectedProject?.slug)
const BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL
const ANALYSIS_URL = computed(() => {
  const selectedProjectSlug = store.selectedProject?.slug
  if (selectedProjectSlug === undefined) return ''
  else return `${BASE_URL}/project/${selectedProjectSlug}/analysis`
})

const MAP_KEY_THAT_SHOULD_NOT_EXIST = 'refactorThis'
const tabHeight = 360

// External data
const apiClientArbimon = inject(apiClientArbimonKey) as AxiosInstance
const { isLoading: isLoadingSiteCount, isError: isErrorSiteCount, data: siteCount } = useSiteCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingRecCount, data: recordingCount } = useRecordingCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSpeciesCount, data: speciesCount } = useSpeciesCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPlaylistCount, data: playlistCount } = usePlaylistCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingRFMCount, data: rfmCount } = useRfmCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingAedCount, data: aedCount } = useAedCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSoundscapeCount, data: soundscapeCount } = useSoundscapeCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPmtCount, data: pmCount } = usePmCount(apiClientArbimon, selectedProjectSlug)

const stats = computed(() => [
  { value: 'site', title: 'Sites created', count: isErrorSiteCount.value ? 0 : siteCount.value, isLoading: isLoadingSiteCount.value, label: 'Create new sites', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/sites` },
  { value: 'recording', title: 'Recordings uploaded', count: recordingCount.value, isLoading: isLoadingRecCount.value, label: 'Upload new recordings', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/recordings` },
  { value: 'species', title: 'Species added to library', count: speciesCount.value, isLoading: isLoadingSpeciesCount.value, label: 'Add a new species', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/species` },
  { value: 'playlist', title: 'Playlists created', count: playlistCount.value, isLoading: isLoadingPlaylistCount.value, label: 'Create a new playlist', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/playlists` }
])

const analyses = computed(() => [
  { value: 'pm', title: 'Pattern Matching', count: rfmCount.value, isLoading: isLoadingRFMCount.value, label: 'Jobs', countTemplate: 0, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/patternmatching` },
  { value: 'rfm', title: 'Random Forest Models', count: aedCount.value, isLoading: isLoadingAedCount.value, label: 'Models', countTemplate: 0, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/random-forest-models/models` },
  { value: 'aed', title: 'AED and Clustering', count: soundscapeCount.value, isLoading: isLoadingSoundscapeCount.value, label: 'Jobs', countTemplate: 0, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/audio-event-detections-clustering` },
  { value: 'soundscapes', title: 'Soundscapes', count: pmCount.value, isLoading: isLoadingPmtCount.value, label: 'Jobs', countTemplate: 0, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/soundscapes` }
])

const getPopupHtml = (data: MapSiteData, dataKey: string): string => `${data.values[dataKey]}`

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
        siteName,
        latitude,
        longitude,
        values: {
          [MAP_KEY_THAT_SHOULD_NOT_EXIST]: id
        }
      })),
    maxValues: { [MAP_KEY_THAT_SHOULD_NOT_EXIST]: 0 }
  }
}

function mapInitialBounds (): LngLatBoundsLike | undefined {
  const project = store.selectedProject
  if (!project) return undefined
  return [[project.longitudeWest, project.latitudeSouth], [project.longitudeEast, project.latitudeNorth]]
}

function circleFormatter (): MapBaseFormatter {
  return new CircleFormatterNormalizedWithMin({ maxValueRaw: 2 })
}

</script>
