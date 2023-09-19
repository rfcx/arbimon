<template>
  <div
    v-if="predictedOccupancyMaps.length > 0"
    class="w-full"
  >
    <section-title>
      <template #title>
        <div class="text-xl text-subtle">
          Predicted Occupancy
        </div>
      </template>
    </section-title>
    <div
      class="mt-5 grid gap-4"
      :class="{ ['md:grid-cols-2']: predictedOccupancyMaps.length> 1 }"
    >
      <div
        v-for="(predictedOccupancyMap, idx) in predictedOccupancyMaps"
        :key="predictedOccupancyMap.title"
        class="relative"
      >
        <a
          :href="blobUrls[idx]"
          target="_blank"
        >
          <img
            :src="predictedOccupancyMap.url"
            :alt="predictedOccupancyMap.title"
          >
        </a>
        <export-button
          class="absolute top-2 right-2"
          @click="downloadImage(predictedOccupancyMap.title, blobUrls[idx])"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'

import type { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { apiBioGetProjectSpeciesPredictedOccupancy } from '@rfcx-bio/common/api-bio/species/project-species-predicted-occupancy'
import { downloadPng } from '@rfcx-bio/utils/file'

import { apiClientBioKey } from '@/globals'

const props = defineProps<{ predictedOccupancyMaps: PredictedOccupancyMap[], speciesSlug: string }>()

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const blobUrls = ref<string[]>([])

watch(() => props.predictedOccupancyMaps, async () => {
  await getBloblImageUrls()
})

const getBloblImageUrls = async (): Promise<void> => {
  blobUrls.value = await Promise.all(props.predictedOccupancyMaps.map(async ({ url }) => {
    const blob = await apiBioGetProjectSpeciesPredictedOccupancy(apiClientBio, url)
    return blob ? window.URL.createObjectURL(blob) : ''
  }))
}

const downloadImage = (filename: string, blobData: string): void => {
  downloadPng(blobData, filename.slice(0, filename.lastIndexOf('.')) ?? filename)
}
</script>
