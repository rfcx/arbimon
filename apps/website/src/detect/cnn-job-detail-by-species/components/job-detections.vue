<template>
  <div class="job-result-detections">
    <div
      v-for="dt in allSpecies"
      :key="`job-detection-result-by-species-${dt.id}`"
      class="inline-block mt-2 mr-4"
    >
      <DetectionItem
        :id="dt.id"
        :spectrogram-url="dt.spectrogramUrl"
        :audio-url="dt.audioUrl"
        :validation="dt.validation"
        :checked="dt.checked"
      />
    </div>
  </div>
  <div class="w-full flex flex-row-reverse">
    <div class="job-result-detections-paginator">
      <button
        class="btn btn-icon"
        :disabled="page - 1 === 0"
        @click="previousPage()"
      >
        <icon-fas-chevron-left class="w-3 h-3" />
      </button>
      <button
        class="btn btn-icon ml-2"
        :disabled="props.data == null || props.data.length < pageSize"
        @click="nextPage()"
      >
        <icon-fas-chevron-right class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { type DetectDetectionsResponse } from '@rfcx-bio/common/api-bio/detect/detect-detections'

import type { DetectionMedia } from '@/detect/cnn-job-detail/components/types'
import { getMediaLink } from '~/media'
import DetectionItem from '../../cnn-job-detail/components/detection-item.vue'

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: DetectDetectionsResponse | undefined, page: number, pageSize: number }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const emit = defineEmits<{(e: 'update:page', value: number): void}>()

const nextPage = (): void => {
  if (props.data == null || props.data.length < props.pageSize) {
    return
  }

  emit('update:page', props.page + 1)
}

const previousPage = (): void => {
  if (props.page - 1 === 0) {
    return
  }

  emit('update:page', props.page - 1)
}

const allSpecies = computed<DetectionMedia[]>(() => {
  if (props.data == null) {
    return []
  }

  return props.data.map(d => {
    return {
      spectrogramUrl: getMediaLink({
        streamId: d.siteId,
        start: d.start,
        end: d.end,
        frequency: 'full',
        gain: 1,
        filetype: 'spec',
        monochrome: true,
        dimension: {
          width: 120,
          height: 120
        },
        contrast: 120,
        fileExtension: 'png'
      }),
      audioUrl: getMediaLink({
        streamId: d.siteId,
        start: d.start,
        end: d.end,
        frequency: 'full',
        gain: 1,
        filetype: 'mp3',
        fileExtension: 'mp3'
      }),
      id: d.id,
      validation: d.reviewStatus
    }
  })
})
</script>
