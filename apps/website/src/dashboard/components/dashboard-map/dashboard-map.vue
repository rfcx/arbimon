<template>
  <map-base-component
    :dataset="mapDataset"
    data-key="refactorThis"
    :loading="map == null"
    :get-popup-html="getPopupHtml"
    map-export-name="dashboard-map"
    :map-id="`dashboard-by-site`"
    :map-initial-bounds="mapInitialBounds ?? undefined"
    :map-base-formatter="circleFormatter"
    :map-height="tabHeight"
    :style-non-zero="circleStyle"
    class="map-bubble w-full"
  />
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { max } from 'lodash-es'
import { type LngLatBoundsLike } from 'mapbox-gl'
import type { ComputedRef } from 'vue'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiBioGetDashboardDataBySite } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-site'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientBioKey, storeKey } from '@/globals'
import { DEFAULT_NON_ZERO_STYLE } from '~/maps/constants'
import { MapBaseComponent } from '~/maps/map-base'
import { type MapBaseFormatter, type MapDataSet, type MapSiteData } from '~/maps/types'
import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'
import { type CircleStyle } from '~/maps/utils/circle-style/types'
import { type BiodiversityStore } from '~/store'
import { useColor } from '../../composables/use-color'
import { type TabValue, MAP_KEY_THAT_SHOULD_NOT_EXIST } from '../../types/tabs'

const props = withDefaults(defineProps<{ selectedTab: TabValue }>(), {
  selectedTab: () => 'speciesRichness'
})

const tabHeight = 360
const store = inject(storeKey) as BiodiversityStore
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const route = useRoute()
const { color } = useColor()

const map = ref(await apiBioGetDashboardDataBySite(apiClientBio, store?.selectedProject?.id ?? -1))

watch(() => route.params.projectSlug, async (newRoute, oldRoute) => {
  if (newRoute !== oldRoute) {
    map.value = await apiBioGetDashboardDataBySite(apiClientBio, store?.selectedProject?.id ?? -1)
  }
})

const mapDataset: ComputedRef<MapDataSet> = computed(() => {
  return {
    startDate: dayjs(),
    endDate: dayjs(),
    sites: store.projectFilters?.locationSites ?? [],
    data: ((props.selectedTab === 'speciesRichness' ? map.value?.richnessBySite : map.value?.detectionBySite) ?? [])
      .map(({ name: siteName, latitude, longitude, value }) => {
        return {
          siteName,
          latitude,
          longitude,
          values: {
            [MAP_KEY_THAT_SHOULD_NOT_EXIST]: value
          }
        }
      }),
    maxValues: {
      [MAP_KEY_THAT_SHOULD_NOT_EXIST]: max(props.selectedTab === 'speciesRichness'
        ? map.value?.richnessBySite.map(d => d.value)
        : map.value?.detectionBySite.map(d => d.value)
      ) ?? 0
    }
  }
})

const mapInitialBounds: ComputedRef<LngLatBoundsLike | null> = computed(() => {
  const project = store.selectedProject

  if (!project) {
    return null
  }

  return [
    [project.longitudeWest, project.latitudeSouth],
    [project.longitudeEast, project.latitudeNorth]
  ]
})

const circleFormatter: ComputedRef<MapBaseFormatter> = computed(() => {
  return new CircleFormatterNormalizedWithMin({
    maxValueRaw: mapDataset.value.maxValues[MAP_KEY_THAT_SHOULD_NOT_EXIST]
  })
})

const getPopupHtml = (data: MapSiteData, dataKey: string): string => data.values[dataKey] as unknown as string

const circleStyle: ComputedRef<CircleStyle> = computed(() => {
  return {
    ...DEFAULT_NON_ZERO_STYLE, color: color.value
  }
})
</script>
