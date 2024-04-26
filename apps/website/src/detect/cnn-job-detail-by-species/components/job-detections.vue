<template>
  <div class="flex flex-col gap-y-4 mt-4">
    <DetectionValidator
      :class="validationCount && isOpen ? 'block' : 'invisible'"
      :detection-count="validationCount"
      :filter-options="filterOptions"
      @emit-validation="validateDetection"
      @emit-close="closeValidator"
    />
    <div>
      <template
        v-for="species in allSpecies"
        :key="'job-detections-' + species.speciesSlug"
      >
        <div
          v-for="dt in species.media"
          :key="`job-detection-result-by-species-${dt.id}`"
          class="inline-block mt-3 mr-4"
        >
          <DetectionItem
            :id="dt.id"
            :spectrogram-url="dt.spectrogramUrl"
            :audio-url="dt.audioUrl"
            :validation="dt.validation"
            :checked="dt.checked"
            :site="dt.site"
            :start="dt.start"
            :score="dt.score"
            @emit-detection="updateSelectedDetections"
          />
        </div>
      </template>
    </div>
  </div>
  <div
    v-if="props.data && !props.data.length && !props.isLoading"
    class="w-full mx-auto text-center mt-35 xl:mt-45"
  >
    <span>No detections found.</span>
  </div>
  <div
    v-if="props.isLoading"
    class="w-full flex justify-center mt-35 xl:mt-45"
  >
    <icon-custom-ic-loading class="animate-spin w-8 h-8 lg:mx-24 text-center" />
  </div>
  <div
    v-if="props.data?.length"
    class="w-full flex flex-row justify-end my-6"
  >
    <div class="flex flex-row items-center text-sm gap-x-1">
      <div class="text-sm">
        <input
          v-model.number="pageIndex"
          type="number"
          min="1"
          :max="5"
          class="text-center bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
        >
      </div>
      <span>of</span>
      <span class="px-1.5 text-sm">{{ maxPage }}</span>
      <span>pages</span>
    </div>
    <div class="flex flex-row gap-x-1">
      <button
        class="btn btn-icon ml-4 rounded-md bg-fog border-0 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="page - 1 === 0"
        @click="previousPage()"
      >
        <icon-fas-chevron-left class="w-3 h-3 text-pitch" />
      </button>
      <button
        class="btn btn-icon ml-2 rounded-md bg-fog border-0 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="props.data == null || props.data.length < pageSize"
        @click="nextPage()"
      >
        <icon-fas-chevron-right class="w-3 h-3 text-pitch" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { groupBy } from 'lodash-es'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type GetDetectionsResponse } from '@rfcx-bio/common/api-bio/cnn/detections'

import { useDetectionsReview } from '@/detect/_composables/use-detections-review'
import { useUpdateDetectionStatus } from '@/detect/_composables/use-update-detection-status'
import DetectionValidator from '@/detect/cnn-job-detail/components/detection-validator.vue'
import type { DetectionMedia, DetectionValidationStatus } from '@/detect/cnn-job-detail/components/types'
import { apiClientKey } from '@/globals'
import { getMediaLink } from '~/media'
import { useStore } from '~/store'
import { validationStatus } from '~/store/detections-constants'
import DetectionItem from '../../cnn-job-detail/components/detection-item.vue'

const store = useStore()
const route = useRoute()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: GetDetectionsResponse | undefined, page: number, pageSize: number, maxPage: number }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const emit = defineEmits<{(e: 'update:page', value: number): void, (e: 'emitValidationResult'): void}>()

const pageIndex = ref(props.page ?? 1)
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

watch(() => props.page, () => {
  pageIndex.value = props.page
})

const nextPage = (): void => {
  if (props.data == null || props.data.length < props.pageSize) {
    return
  }
  emit('update:page', pageIndex.value + 1)
}

const previousPage = (): void => {
  if (pageIndex.value - 1 === 0) {
    return
  }
  emit('update:page', pageIndex.value - 1)
}

const filterOptions = computed<DetectionValidationStatus[]>(() => {
  // removes the `All` setting
  const filtered: DetectionValidationStatus[] = validationStatus.filter(v => v.value !== 'all')
  .map(s => {
    return {
      value: s.value,
      label: s.label,
      checked: s.value === 'unvalidated'
    } as DetectionValidationStatus
  })

  return filtered
})

const allSpecies = computed<Array<{ speciesSlug: string, speciesName: string, media: DetectionMedia[] }>>(() => {
  if (props.data == null || props.data.length === 0) {
    return []
  }

  const groupedDetections: Record<string, GetDetectionsResponse> = groupBy(props.data ?? [], d => d.classification.value)
  const species: Array<{ speciesSlug: string, speciesName: string, media: DetectionMedia[] }> = Object.keys(groupedDetections).map(slug => {
    return {
      speciesSlug: slug,
      speciesName: groupedDetections[slug][0].classification.title,
      media: groupedDetections[slug].map(detection => {
        return {
          spectrogramUrl: getMediaLink({
            streamId: detection.siteIdCore,
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
            streamId: detection.siteIdCore,
            start: detection.start,
            end: detection.end,
            frequency: 'full',
            gain: 1,
            filetype: 'mp3',
            fileExtension: 'mp3'
          }),
          id: detection.id,
          validation: detection.reviewStatus,
          score: detection.confidence,
          start: detection.start,
          site: store.projectFilters?.locationSites.filter((site) => site.idCore === detection.siteIdCore)[0]?.name ?? ''
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

const { mutate: mutateUpdateDetectionStatus } = useUpdateDetectionStatus(apiClientBio)

const validateDetection = async (validation: ArbimonReviewStatus): Promise<void> => {
  const selectedDetectionIds = getSelectedDetectionIds()

  const promises = selectedDetectionIds.map(id => {
    const originalDetection = (props.data ?? []).find(d => Number(id) === d.id)
    return mutateUpdateDetectionStatus({
      jobId: jobId.value,
      siteIdCore: originalDetection?.siteIdCore ?? '',
      start: originalDetection?.start ?? '',
      status: validation as Exclude<ArbimonReviewStatus, 'unvalidated'>,
      classificationValue: originalDetection?.classification?.value ?? '',
      classifierId: originalDetection?.classifierId ?? -1
    }, {
      onSuccess: () => {},
      onError: () => {}
    })
  })

  const responses = await Promise.allSettled(promises)
  updateValidatedDetections(selectedDetectionIds, validation, responses)
  emit('emitValidationResult')
}
</script>
