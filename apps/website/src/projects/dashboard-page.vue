<template>
  <section class="w-screen-lg pt-28 mx-auto">
    <div class="text-gray-900 dark:text-white">
      <h1 class="text-5xl font-header font-normal <sm:text-2xl">
        {{ store.selectedProject?.name }}
      </h1>
    </div>
    <div class="text-gray-900 dark:text-white pt-20">
      <h2 class="font-display text-4xl font-medium <sm:text-xl">
        Overview
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-6 pt-6">
        <DashboardOverview
          v-for="stat in stats"
          :key="stat.value"
          :stat="stat"
        />
      </div>
    </div>
    <div class="text-gray-900 dark:text-white pt-20">
      <div class="flex items-center space-x-8">
        <h2 class="font-display text-4xl font-medium <sm:text-xl">
          Analyses
        </h2>
        <a
          class="btn btn-primary flex text-xs items-center space-x-3 px-6 py-3"
          :title="'Create New Analysis Job'"
          :href="ANALYSIS_URL"
          target="_blank"
        >
          <icon-fa-plus-circle class="h-3 w-3" />
          <span class="font-display text-base">Create new analysis</span>
        </a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 pt-6">
        <DashboardAnalyses
          v-for="analysis in analyses"
          :key="analysis.value"
          :analysis="analysis"
        />
      </div>
      <div class="text-gray-900 dark:text-white pt-20">
        <h2 class="font-display text-4xl font-medium sm:text-xl">
          Sites
        </h2>
        <div class="w-full text-black mapboxgl-map pt-6">
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
import { useAedJobCount, useClusteringJobCount, useClusteringSpeciesDetected } from './_composables/use-aed-count'
import { usePlaylistCount } from './_composables/use-playlist-count'
import { usePmSpeciesDetected, usePmTemplateCount } from './_composables/use-pm-count'
import { useRecordingCount } from './_composables/use-recording-count'
import { useRfmJobCount, useRfmSpeciesDetected } from './_composables/use-rfm-count'
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
const { isLoading: isLoadingRFMCount, data: rfmCount } = useRfmJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSpDetected, data: rfmSpDetected } = useRfmSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingAedJobCount, data: aedJobCount } = useAedJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingClusteringJobCount, data: clusteringJobCount } = useClusteringJobCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingClusteringSpDetected, data: clusteringSpDetected } = useClusteringSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingSoundscapeCount, data: soundscapeCount } = useSoundscapeCount(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPmtCount, data: pmSpeciesCount } = usePmSpeciesDetected(apiClientArbimon, selectedProjectSlug)
const { isLoading: isLoadingPmTemplateCount, data: pmTemplateCount } = usePmTemplateCount(apiClientArbimon, selectedProjectSlug)

const stats = computed(() => [
  { value: 'site', title: 'Sites Created', count: isErrorSiteCount.value ? 0 : siteCount.value, isLoading: isLoadingSiteCount.value, label: 'Create new sites', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/sites` },
  { value: 'recording', title: 'Recordings', count: recordingCount.value, isLoading: isLoadingRecCount.value, label: 'Upload new recordings', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/recordings` },
  { value: 'playlist', title: 'Playlists Created', count: playlistCount.value, isLoading: isLoadingPlaylistCount.value, label: 'Create new playlist', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/playlists` },
  { value: 'species', title: 'Species Detected', count: speciesCount.value, isLoading: isLoadingSpeciesCount.value, label: 'Add new species', link: `${BASE_URL}/project/${selectedProject.value?.slug}/audiodata/species` }
])

const analyses = computed(() => [
  { value: 'pm', title: 'Pattern Matching', count: pmSpeciesCount.value, isLoading: isLoadingPmtCount.value || isLoadingPmTemplateCount.value, label: 'Number of templates', speciesTitle: 'Number of species analyzed', speciesDetected: pmTemplateCount.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/patternmatching` },
  { value: 'soundscapes', title: 'Soundscapes', count: soundscapeCount.value, isLoading: isLoadingSoundscapeCount.value, label: 'Number of soundscapes', link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/soundscapes` },
  { value: 'aed', title: 'AED & Clustering', count: (aedJobCount.value != null) ? aedJobCount.value : 0 + ((clusteringJobCount.value != null) ? clusteringJobCount.value : 0), isLoading: isLoadingAedJobCount.value || isLoadingClusteringJobCount.value || isLoadingClusteringSpDetected.value, label: 'Number of jobs created', speciesTitle: 'Number of species detected', speciesDetected: clusteringSpDetected.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/audio-event-detections-clustering` },
  { value: 'rfm', title: 'Random Forest Models', count: rfmCount.value, isLoading: isLoadingRFMCount.value || isLoadingSpDetected.value, label: 'Number of models created', speciesTitle: 'Number of species analyzed', speciesDetected: rfmSpDetected.value, link: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/random-forest-models/models` }
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
      .map(({ name: siteName, latitude, longitude }) => ({
        siteName: 'Site Name',
        latitude,
        longitude,
        values: {
          [MAP_KEY_THAT_SHOULD_NOT_EXIST]: siteName
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
