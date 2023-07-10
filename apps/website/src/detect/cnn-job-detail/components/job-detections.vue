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
      v-if="validationCount && isOpen"
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
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type DetectDetectionsQueryParams, type DetectDetectionsResponse, type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { apiBioDetectReviewDetection } from '@rfcx-bio/common/api-bio/detect/review-detections'

import { useGetJobDetections } from '@/detect/_composables/use-get-detections'
import { apiClientBioKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDetectionsResultFilterStore } from '~/store'
import DetectionItem from './detection-item.vue'
import DetectionValidator from './detection-validator.vue'
import type { DetectionEvent, DetectionMedia, DetectionValidationStatus } from './types'

const MAX_DISPLAY_PER_EACH_SPECIES = 20

const filterOptions: DetectionValidationStatus[] = [
  { value: 'confirmed', label: 'Present', checked: false },
  { value: 'rejected', label: 'Not Present', checked: false },
  { value: 'uncertain', label: 'Unknown', checked: false },
  { value: 'unreviewed', label: 'Unvalidated', checked: true }
]

const validationCount = ref<number | null>(null)
const isOpen = ref<boolean | null>(null)
const isShiftHolding = ref<boolean>(false)
const isCtrlHolding = ref<boolean>(false)
const currentDetectionId = ref<string | undefined>(undefined)
const detectionsResultFilterStore = useDetectionsResultFilterStore()

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const route = useRoute()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

const params = computed<DetectDetectionsQueryParams>(() => ({
  start: '2023-02-20',
  end: '2023-02-21',
  sites: detectionsResultFilterStore.filter.siteIds,
  minConfidence: detectionsResultFilterStore.formattedThreshold,
  reviewStatuses: detectionsResultFilterStore.filter.validationStatus === 'all' ? undefined : [detectionsResultFilterStore.filter.validationStatus],
  classifiers: [3],
  descending: detectionsResultFilterStore.filter.sortBy === 'desc'
}))

const { data } = useGetJobDetections(apiClientBio, jobId.value, params)

watch(() => isShiftHolding.value, (newVal, oldVal) => {
  if (newVal !== oldVal && isShiftHolding.value === false) {
    resetSelection(currentDetectionId.value)
    validationCount.value = getValidationCount()
  }
})

watch(() => isCtrlHolding.value, (newVal, oldVal) => {
  if (newVal !== oldVal && isCtrlHolding.value === false) {
    resetSelection(currentDetectionId.value)
    validationCount.value = getValidationCount()
  }
})

const allSpecies = computed(() => {
  const groupedDetections: Record<string, DetectDetectionsResponse> = groupBy(data.value ?? [], d => d.classification.value)
  const species: Array<{ speciesSlug: string, speciesName: string, media: DetectionMedia[] }> = Object.keys(groupedDetections).map(slug => {
    return {
      speciesSlug: slug,
      speciesName: groupedDetections[slug][0].classification.title,
      media: groupedDetections[slug].map(detection => {
        return {
          spectrogramUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_d120.120_mtrue_fspec.png',
          audioUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_fwav.wav',
          id: detection.id,
          validation: detection.reviewStatus
        }
      })
    }
  })

  return species
})

const displaySpecies = (media: DetectionMedia[]) => {
  return media.slice(0, Math.min(media.length, MAX_DISPLAY_PER_EACH_SPECIES))
}

const updateSelectedDetections = (detectionId: string, event: DetectionEvent) => {
  const { isSelected, isShiftKeyHolding, isCtrlKeyHolding } = event
  selectDetection(detectionId, isSelected)
  currentDetectionId.value = detectionId
  isShiftHolding.value = isShiftKeyHolding
  isCtrlHolding.value = isCtrlKeyHolding
  if (isShiftHolding.value) {
    const combinedDetections = getCombinedDetections()
    const selectedDetectionIds = getSelectedDetectionIds()
    const firstInx = combinedDetections.findIndex(d => d.id === selectedDetectionIds[0])
    const secondInx = combinedDetections.findIndex(d => d.id === selectedDetectionIds[selectedDetectionIds.length - 1])
    const arrayOfIndx = [firstInx, secondInx].sort((a, b) => a - b)
    const filteredDetections = combinedDetections.filter((_det, index) => index >= arrayOfIndx[0] && index <= arrayOfIndx[1])
    const ids = filteredDetections.map(det => det.id)
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (ids.includes(det.id)) {
          det.checked = true
        }
      })
    })
  }
  validationCount.value = getValidationCount()
  isOpen.value = true
}

const resetSelection = (skippedId?: string) => {
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (skippedId !== undefined && det.id === skippedId) return
      det.checked = false
    })
  })
}

const selectDetection = (detectionId: string, checked: boolean) => {
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (detectionId === det.id) {
        det.checked = checked
      }
    })
  })
}

const getSelectedDetectionIds = () => {
  const selectedDetectionIds: string[] = []
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (det.checked === true) {
        selectedDetectionIds.push(det.id)
      }
    })
  })

  // use localeCompare to sort because it's bigint, we could lose precision in the future
  return selectedDetectionIds.sort((a, b) => a.localeCompare(b))
}

const getValidationCount = () => {
  let count = 0
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (det.checked === true) {
        count++
      }
    })
  })

  return count
}

const getCombinedDetections = () => {
  let combinedDetections = [] as DetectionMedia[]
  allSpecies.value.forEach(species => {
    combinedDetections = combinedDetections.concat(species.media)
  })

  return combinedDetections
}

const validateDetection = async (validation: ReviewStatus): Promise<void> => {
  // pause query
  const selectedDetectionIds = getSelectedDetectionIds()

  console.info('species to validate', selectedDetectionIds)
  console.info('validation: ', validation)

  // call review api
  const promises = selectedDetectionIds.map(id => {
    // this will always be a success case
    const originalDetection = (data.value ?? []).find(d => id === d.id)

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

  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      // only update status to success review update
      if (selectedDetectionIds.includes(det.id) && responses.find(r => r.status === 'fulfilled') != null) {
        det.validation = validation
      }
    })
  })
  validationCount.value = null
  resetSelection()
  isOpen.value = false
}

const closeValidator = () => {
  isOpen.value = false
}
</script>
