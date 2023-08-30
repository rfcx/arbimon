<template>
  <div class="job-result-detections">
    <template
      v-for="species in allSpecies"
      :key="'job-detections-' + species.speciesSlug"
    >
      <div
        v-for="dt in species.media"
        :key="`job-detection-result-by-species-${dt.id}`"
        class="inline-block mt-2 mr-4"
      >
        <DetectionItem
          :id="dt.id"
          :spectrogram-url="dt.spectrogramUrl"
          :audio-url="dt.audioUrl"
          :validation="dt.validation"
          :checked="dt.checked"
          @emit-detection="updateSelectedDetections"
        />
      </div>
    </template>
  </div>
  <div class="w-full flex flex-row-reverse">
    <div class="job-result-detections-paginator">
      <button
        :class="page - 1 === 0 ? 'not-disabled:btn cursor-not-allowed bg-util-gray-02 not-disabled:btn-icon' : 'not-disabled:btn not-disabled:btn-icon'"
        @click="previousPage()"
      >
        <icon-fas-chevron-left class="w-3 h-3" />
      </button>
      <button
        :class="props.data == null || props.data.length < pageSize ? 'not-disabled:btn not-disabled:btn-icon ml-2 cursor-not-allowed bg-util-gray-02' : 'not-disabled:btn not-disabled:btn-icon ml-2'"
        @click="nextPage()"
      >
        <icon-fas-chevron-right class="w-3 h-3" />
      </button>
    </div>
  </div>
  <DetectionValidator
    v-if="validationCount && isOpen"
    :detection-count="validationCount"
    :filter-options="filterOptions"
    @emit-validation="validateDetection"
    @emit-close="closeValidator"
  />
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { groupBy } from 'lodash-es'
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'

import { type DetectDetectionsResponse, type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { apiBioDetectReviewDetection } from '@rfcx-bio/common/api-bio/detect/review-detections'

import { useDetectionsReview } from '@/detect/_composables/use-detections-review'
import DetectionValidator from '@/detect/cnn-job-detail/components/detection-validator.vue'
import type { DetectionMedia, DetectionValidationStatus } from '@/detect/cnn-job-detail/components/types'
import { apiClientBioKey } from '@/globals'
import { getMediaLink } from '~/media'
import { validationStatus } from '~/store/detections-constants'
import DetectionItem from '../../cnn-job-detail/components/detection-item.vue'

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: DetectDetectionsResponse | undefined, page: number, pageSize: number }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const emit = defineEmits<{(e: 'update:page', value: number): void}>()

const route = useRoute()

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

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

const filterOptions = computed<DetectionValidationStatus[]>(() => {
  // removes the `All` setting
  const filtered: DetectionValidationStatus[] = validationStatus.filter(v => v.value !== 'all')
  .map(s => {
    return {
      value: s.value,
      label: s.label,
      checked: s.value === 'unreviewed'
    } as DetectionValidationStatus
  })

  return filtered
})

const allSpecies = computed<Array<{ speciesSlug: string, speciesName: string, media: DetectionMedia[] }>>(() => {
  if (props.data == null || props.data.length === 0) {
    return []
  }

  const groupedDetections: Record<string, DetectDetectionsResponse> = groupBy(props.data ?? [], d => d.classification.value)
  const species: Array<{ speciesSlug: string, speciesName: string, media: DetectionMedia[] }> = Object.keys(groupedDetections).map(slug => {
    return {
      speciesSlug: slug,
      speciesName: groupedDetections[slug][0].classification.title,
      media: groupedDetections[slug].map(detection => {
        return {
          spectrogramUrl: '0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_d120.120_mtrue_fspec.png',
          audioUrl: '0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_fwav.wav',
          id: detection.id,
          validation: detection.reviewStatus
        //   spectrogramUrl: getMediaLink({
        //     streamId: detection.siteId,
        //     start: detection.start,
        //     end: detection.end,
        //     frequency: 'full',
        //     gain: 1,
        //     filetype: 'spec',
        //     monochrome: true,
        //     dimension: {
        //       width: 120,
        //       height: 120
        //     },
        //     contrast: 120,
        //     fileExtension: 'png'
        //   }),
        //   audioUrl: getMediaLink({
        //     streamId: detection.siteId,
        //     start: detection.start,
        //     end: detection.end,
        //     frequency: 'full',
        //     gain: 1,
        //     filetype: 'mp3',
        //     fileExtension: 'mp3'
        //   }),
        //   id: detection.id,
        //   validation: detection.reviewStatus
        }
      })
    }
  })

  return species
})

const {
  validationCount,
  isOpen,
  closeValidator,
  updateSelectedDetections,
  updateValidatedDetections,
  getSelectedDetectionIds
} = useDetectionsReview(allSpecies)

const validateDetection = async (validation: ReviewStatus): Promise<void> => {
  const selectedDetectionIds = getSelectedDetectionIds()

  // call review api
  const promises = selectedDetectionIds.map(id => {
    // this will always be a success case
    const originalDetection = (props.data ?? []).find(d => id === d.id)

    return apiBioDetectReviewDetection(apiClientBio, jobId.value, {
      // this is a safe cast because the validation selector always start at 'unreviewed' union
      // and the emitter is emitted when there's a change (watch), which means the change will
      // always be from 'unreviewed' to other type.
      status: validation as Exclude<ReviewStatus, 'unreviewed'>,
      classification: originalDetection?.classification?.value ?? '',
      streamId: originalDetection?.siteId ?? '',
      classifier: originalDetection?.classifierId ?? -1,
      start: originalDetection?.start ?? ''
    })
  })

  const responses = await Promise.allSettled(promises)
  updateValidatedDetections(selectedDetectionIds, validation, responses)
}
</script>
