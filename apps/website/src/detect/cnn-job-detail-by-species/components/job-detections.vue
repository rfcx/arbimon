<template>
  <div class="flex flex-col gap-y-4 mt-4">
    <DetectionValidator
      :class="validationCount && isOpen ? 'block' : 'invisible'"
      :detection-count="validationCount"
      :filter-options="filterOptions"
      :is-processing="isProcessing"
      :validation="getSuggestedValidationStatus()"
      @emit-validation="validateDetection"
      @emit-close="closeValidator"
    />
    <div
      v-if="!props.isLoading"
      class="4xl:pl-28"
    >
      <template
        v-for="species in allSpecies"
        :key="'job-detections-' + species.speciesSlug"
      >
        <h4
          v-if="isBestDetections"
          class="flex mb-1"
        >
          {{ species.siteName }}
        </h4>
        <div :class="{'mb-3' : isBestDetections}">
          <div
            v-for="dt in species.media"
            :key="`job-detection-result-by-species-${dt.id}`"
            class="inline-block my-3 mr-3"
          >
            <DetectionItem
              :id="dt.id"
              :spectrogram-url="dt.spectrogramUrl"
              :audio-url="dt.audioUrl"
              :validation="dt.validation"
              :checked="dt.checked"
              :site="dt.site"
              :site-id-core="dt.siteIdCore"
              :start="dt.start"
              :score="dt.score"
              :selected-grouping="selectedGrouping"
              @emit-detection="updateSelectedDetections"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
  <div
    v-if="!allSpecies?.length && !props.isLoading"
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
    v-if="allSpecies?.length && !props.isLoading"
    class="w-full flex flex-row justify-end my-6"
  >
    <div class="flex flex-row items-center text-sm gap-x-1">
      <div class="text-sm">
        <input
          v-model.number="pageIndex"
          type="number"
          min="1"
          :max="maxPage"
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
        :disabled="disabledNextPageBtn"
        @click="nextPage()"
      >
        <icon-fas-chevron-right class="w-3 h-3 text-pitch" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounce } from '@vueuse/core'
import type { AxiosInstance } from 'axios'
import { groupBy } from 'lodash-es'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type GetBestDetectionsResponse } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type GetDetectionsResponse } from '@rfcx-bio/common/api-bio/cnn/detections'
import { apiBioUpdateDetectionStatus } from '@rfcx-bio/common/api-bio/cnn/reviews'

import { useDetectionsReview } from '@/detect/_composables/use-detections-review'
import DetectionValidator from '@/detect/cnn-job-detail/components/detection-validator.vue'
import type { DetectionMedia, DetectionValidationStatus } from '@/detect/cnn-job-detail/components/types'
import { apiClientKey } from '@/globals'
import { getMediaLink } from '~/media'
import { useDetectionsResultFilterBySpeciesStore, useStore } from '~/store'
import { validationStatus } from '~/store/detections-constants'
import DetectionItem from '../../cnn-job-detail/components/detection-item.vue'

const store = useStore()
const route = useRoute()
const detectionFilterStore = useDetectionsResultFilterBySpeciesStore()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const props = withDefaults(defineProps<{ isLoading: boolean, isError: boolean, data: GetDetectionsResponse | undefined, dataBestDetections: GetBestDetectionsResponse | undefined, page: number, pageSize: number, maxPage: number, selectedGrouping: string | undefined }>(), {
  isLoading: true,
  isError: false,
  data: undefined
})

const emit = defineEmits<{(e: 'update:page', value: number): void, (e: 'emitValidationResult'): void}>()

const pageIndex = ref(props.page ?? 1)
const index = useDebounce(pageIndex, 1000)
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)
const isBestDetections = computed(() => props.selectedGrouping === 'topScorePerSitePerDay' || props.selectedGrouping === 'topScorePerSite')
const disabledNextPageBtn = computed(() => {
  if (isBestDetections.value) {
    return props.dataBestDetections == null || props.dataBestDetections.length < props.pageSize
  } else {
    return props.data == null || props.data.length < props.pageSize
  }
})

watch(() => props.page, () => {
  pageIndex.value = props.page
})

watch(() => index.value, (value) => {
  if (value <= props.maxPage && value >= 1) {
    emit('update:page', index.value)
  }

  // if the value is out of bounds, reset it
  if (value > props.maxPage) {
    pageIndex.value = props.maxPage
  } else if (value < 1) {
    pageIndex.value = 1
  }
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
  const filtered: DetectionValidationStatus[] = validationStatus
  .map(s => {
    return {
      value: s.value,
      label: s.label,
      checked: s.value === 'unvalidated'
    } as DetectionValidationStatus
  })

  return filtered
})

const allSpecies = computed<Array<{ siteName: string, speciesSlug: string, speciesName: string, media: DetectionMedia[] }>>(() => {
  // TODO: refactor this as there isn't a need to group the detections by classification anymore (UI has changed + api was broken)
  // workaround for now => groupBy classifierId instead (workaround for the broken api)

  const groupedDetectionsBySite: Record<string, GetBestDetectionsResponse> = groupBy(props.dataBestDetections ?? [], d => d.siteIdCore)
  const groupedDetections: Record<string, GetDetectionsResponse> = groupBy(props.data ?? [], d => d.classifierId)
  const items = isBestDetections.value ? groupedDetectionsBySite : groupedDetections
  const species: Array<{ siteName: string, speciesSlug: string, speciesName: string, media: DetectionMedia[] }> = Object.keys(items).map(id => {
    return {
      siteName: store.projectFilters?.locationSites.filter((site) => site.idCore === id)[0]?.name ?? '',
      speciesSlug: '',
      speciesName: '',
      media: items[id].map(detection => {
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
              width: 300,
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
          siteIdCore: detection.siteIdCore,
          site: store.projectFilters?.locationSites.filter((site) => site.idCore === detection.siteIdCore)[0]?.name ?? ''
        }
      })
    }
  })

  return species
})

const {
  validationCount,
  getSuggestedValidationStatus,
  isOpen,
  isProcessing,
  closeValidator,
  updateSelectedDetections,
  updateValidatedDetections,
  updateIsProcessing,
  getSelectedDetections
} = useDetectionsReview(allSpecies)

const validateDetection = async (validation: ArbimonReviewStatus): Promise<void> => {
  const selectedDetections = getSelectedDetections()
  updateIsProcessing(true)
  const promises = selectedDetections.map(async sd => {
    const items = isBestDetections.value ? props.dataBestDetections : props.data
    const originalDetection = (items ?? []).find(d => Number(sd.id) === d.id)
    return apiBioUpdateDetectionStatus(apiClientBio, {
      jobId: jobId.value,
      siteIdCore: originalDetection?.siteIdCore ?? '',
      start: originalDetection?.start ?? '',
      status: validation as Exclude<ArbimonReviewStatus, 'unvalidated'>,
      classificationValue: originalDetection?.classification?.value ?? '',
      classifierId: originalDetection?.classifierId ?? -1
    }).catch(e => {
      console.error('VALIDATION: error', e)
      // TODO: handle error
    })
  })

  const responses = await Promise.allSettled(promises)
  updateIsProcessing(false)
  console.info('VALIDATION: all done', responses)
  updateValidatedDetections(selectedDetections.map((d) => d.id), validation, responses)
  // TODO:  #1995 take into account the responses to update the review summary
  const changes = selectedDetections.map((d) => {
    return {
      from: d.prevStatus,
      to: validation
    }
  })
  // update the review summary manually
  detectionFilterStore.updateReviewSummaryManually(changes)
  emit('emitValidationResult')
}
</script>
