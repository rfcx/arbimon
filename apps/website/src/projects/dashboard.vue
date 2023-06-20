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
          class="btn btn-icon flex items-center space-x-3"
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
import { inject } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientArbimonKey } from '@/globals'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { type CircleStyle } from '~/maps/utils/circle-style/types'
import { useStore } from '~/store'
import { usePlaylistCount } from './_composables/use-playlist-count'
import { useRecordingCount } from './_composables/use-recording-count'
import { useSiteCount } from './_composables/use-site-count'
import { useSpeciesCount } from './_composables/use-species-count'
import DashboardAnalyses from './components/dashboard-analyses.vue'
import DashboardOverview from './components/dashboard-overview.vue'

const store = useStore()
const BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL
const ANALYSIS_URL = `${BASE_URL}/project/${store.selectedProject?.slug}/analysis`

const MAP_KEY_THAT_SHOULD_NOT_EXIST = 'refactorThis'
const tabHeight = 360

// External data
const apiClientArbimon = inject(apiClientArbimonKey) as AxiosInstance
const { isLoading: isLoadingSiteCount, data: siteCount } = useSiteCount(apiClientArbimon, { slug: store.selectedProject?.slug })
const { isLoading: isLoadingRecCount, data: recordingCount } = useRecordingCount(apiClientArbimon, { slug: store.selectedProject?.slug })
const { isLoading: isLoadingSpeciesCount, data: speciesCount } = useSpeciesCount(apiClientArbimon, { slug: store.selectedProject?.slug })
const { isLoading: isLoadingPlaylistCount, data: playlistCount } = usePlaylistCount(apiClientArbimon, { slug: store.selectedProject?.slug })

const stats = [
  { value: 'site', title: 'Sites created', count: siteCount, isLoading: isLoadingSiteCount, label: 'Create new sites', link: `${BASE_URL}/project/${store.selectedProject?.slug}/audiodata/sites` },
  { value: 'recording', title: 'Recordings uploaded', count: recordingCount, isLoading: isLoadingRecCount, label: 'Upload new recordings', link: `${BASE_URL}/project/${store.selectedProject?.slug}/audiodata/recordings` },
  { value: 'species', title: 'Species added to library', count: speciesCount, isLoading: isLoadingSpeciesCount, label: 'Add a new species', link: `${BASE_URL}/project/${store.selectedProject?.slug}/audiodata/species` },
  { value: 'playlist', title: 'Playlists created', count: playlistCount, isLoading: isLoadingPlaylistCount, label: 'Create a new playlist', link: `${BASE_URL}/project/${store.selectedProject?.slug}/audiodata/playlists` }
]

const analyses = [
  { value: 'pm', title: 'Pattern Matching', count: 0, label: 'Jobs', countTemplate: 0, link: `${BASE_URL}/project/${store.selectedProject?.slug}/analysis/patternmatching` },
  { value: 'rfm', title: 'Random Forest Models', count: 0, label: 'Models', countTemplate: 0, link: `${BASE_URL}/project/${store.selectedProject?.slug}/analysis/random-forest-models/models` },
  { value: 'aed', title: 'AED and Clustering', count: 0, label: 'Jobs', countTemplate: 0, link: `${BASE_URL}/project/${store.selectedProject?.slug}/analysis/audio-event-detections-clustering` },
  { value: 'soundscapes', title: 'Soundscapes', count: 0, label: 'Jobs', countTemplate: 0, link: `${BASE_URL}/project/${store.selectedProject?.slug}/analysis/soundscapes` }
]

const getPopupHtml = (data: MapSiteData, dataKey: string): number | boolean => data.values[dataKey]

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
