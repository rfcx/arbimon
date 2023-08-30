<template>
  <div class="job-result-wrapper">
    <template
      v-for="species in allSpecies"
      :key="'job-detections-' + species.speciesSlug"
    >
      <h3 class="species-title text-lg mt-4">
        {{ species.speciesName }} ({{ species.speciesSlug }})
      </h3>
      <div
        v-for="(media, idx) in displaySpecies(species.media)"
        :key="'job-detection-media-' + species.speciesName + idx"
        class="inline-block mt-2 mr-2"
      >
        <detection-item
          :id="media.id"
          :spectrogram-url="media.spectrogramUrl"
          :audio-url="media.audioUrl"
          :validation="media.validation"
          :checked="media.checked"
          @emit-detection="updateSelectedDetections"
        />
      </div>
      <div class="flex">
        <router-link
          v-if="species.media.length > MAX_DISPLAY_PER_EACH_SPECIES"
          class="block font-weight-bold hover:(text-subtle cursor-pointer)"
          :to="{ name: ROUTE_NAMES.cnnJobDetailBySpecies, params: { jobId, speciesSlug: species.speciesSlug } }"
        >
          SEE MORE+
        </router-link>
      </div>
    </template>
    <detection-validator
      v-if="validationCount !== 0 && isOpen"
      :detection-count="validationCount"
      :filter-options="filterOptions"
      @emit-validation="validateDetection"
      @emit-close="closeValidator"
    />
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { groupBy } from 'lodash-es'
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'

import { type DetectDetectionsResponse, type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { apiBioDetectReviewDetection } from '@rfcx-bio/common/api-bio/detect/review-detections'

import { useDetectionsReview } from '@/detect/_composables/use-detections-review'
import { apiClientBioKey } from '@/globals'
import { getMediaLink } from '~/media'
import { ROUTE_NAMES } from '~/router'
import { useDetectionsResultFilterStore } from '~/store'
import DetectionItem from './detection-item.vue'
import DetectionValidator from './detection-validator.vue'
import type { DetectionMedia, DetectionValidationStatus } from './types'

const MAX_DISPLAY_PER_EACH_SPECIES = 20

const detectionsResultFilterStore = useDetectionsResultFilterStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const route = useRoute()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: DetectDetectionsResponse | undefined }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const filterOptions = computed<DetectionValidationStatus[]>(() => {
  const validation = detectionsResultFilterStore.validationStatusFilterOptions

  // removes the `All` setting
  const filtered: DetectionValidationStatus[] = validation.filter(v => v.value !== 'all')
  .map(s => {
    return {
      value: s.value,
      label: s.label,
      checked: s.value === 'unreviewed'
    } as DetectionValidationStatus
  })

  return filtered
})

const allSpecies = computed(() => {
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
          spectrogramUrl: getMediaLink({
            streamId: detection.siteId,
            start: detection.start,
            end: detection.end,
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
            streamId: detection.siteId,
            start: detection.start,
            end: detection.end,
            frequency: 'full',
            gain: 1,
            filetype: 'mp3',
            fileExtension: 'mp3'
          }),
          id: detection.id,
          validation: detection.reviewStatus
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

const displaySpecies = (media: DetectionMedia[]) => {
  return media.slice(0, Math.min(media.length, MAX_DISPLAY_PER_EACH_SPECIES))
}

const validateDetection = async (validation: ReviewStatus): Promise<void> => {
  // TODO: pause query before running this script?
  // The reason to pause is that maybe the detections ping could alter with
  // the array and causes inconsistencies
  // in the section of the detections that we need to validate.
  // check out here on how to disable query: https://tanstack.com/query/v4/docs/vue/guides/disabling-queries#lazy-queries
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
