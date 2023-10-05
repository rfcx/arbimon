<template>
  <div class="graphic-tabs">
    <ol class="text-xl lg:text-2xl xl:text-3xl">
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        class="cursor-pointer inline-block p-2 border-b-2 hover:text-frequency hover:border-frequency font-header font-2xl"
        :class="{ 'text-frequency border-frequency border-b-2': selectedTab === tabs[index].value }"
        :aria-selected="selectedTab === tabs[index].value"
        :tabindex="index"
        @click="selectedTab = tabs[index].value"
      >
        {{ tab.label }}
      </li>
    </ol>
  </div>
  <div
    v-if="!isLoading || !isError"
    class="inline-grid w-full gap-2 mt-2 xl:grid-cols-2"
  >
    <!-- TODO: fix this to use map compomnent -->
    <span class="hidden">{{ mapDataset.maxValues }}</span>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, ref } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

// import { MapBaseComponent } from '~/maps/map-base'
import { apiClientBioKey } from '@/globals'
import { type MapDataSet } from '~/maps/types'
import { useStore } from '~/store'
import { useGetDashboardDataBySite } from './_composables/use-get-visaulizer'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()

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

const selectedTab = ref(tabs[0].value)
const { isLoading: isLoadingDataBySite, isError: isErrorDataBySite, data: dataBySite } = useGetDashboardDataBySite(apiClientBio, store.selectedProject?.id ?? -1)
const richnessMapDataBySite = computed(() => dataBySite.value?.richnessBySite ?? [])
// TODO: add detections data

const isLoading = computed(() => selectedTab.value === TAB_VALUES.richness ? isLoadingDataBySite.value : false)
const isError = computed(() => selectedTab.value === TAB_VALUES.richness ? isErrorDataBySite.value : false)
const data = computed(() => selectedTab.value === TAB_VALUES.richness ? richnessMapDataBySite.value : dataBySite.value?.detectionBySite ?? [])

const mapDataset: ComputedRef<MapDataSet> = computed(() => {
  return {
      startDate: dayjs(),
      endDate: dayjs(),
      sites: store.projectFilters?.locationSites ?? [],
      data: data.value
        .map(({ name: siteName, latitude, longitude, value }) => ({
          siteName,
          latitude,
          longitude,
          values: {
            [selectedTab.value]: value
          }
        })),
      maxValues: {
        [selectedTab.value]: Math.max(...data.value.map(({ value }) => value))
      }
    }
})

</script>
