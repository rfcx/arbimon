<template>
  <div class="job-result-wrapper">
    <template
      v-for="species in allSpecies"
      :key="'job-detections-' + species.speciesName"
    >
      <h3 class="species-title text-lg mt-4">
        {{ species.speciesName }}
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
import { AxiosInstance } from 'axios'
import { computed, inject, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useClassifierJobs } from '@/detect/_composables/use-classifier-jobs'
import { useGetDetection } from '@/detect/_composables/use-get-detection'
import { apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import DetectionItem from './detection-item.vue'
import DetectionValidator from './detection-validator.vue'
import { DetectionEvent, DetectionMedia, DetectionValidationStatus } from './types'

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance

const MAX_DISPLAY_PER_EACH_SPECIES = 20

const filterOptions: DetectionValidationStatus[] = [
  { value: 'present', label: 'Present', checked: false },
  { value: 'not_present', label: 'Not Present', checked: false },
  { value: 'unknown', label: 'Unknown', checked: false },
  { value: 'unvalidated', label: 'Unvalidated', checked: true }
]

const validationCount = ref<number | null>(null)
const isOpen = ref<boolean | null>(null)
const isShiftHolding = ref<boolean>(false)
const isCtrlHolding = ref<boolean>(false)
const currentDetectionId = ref<number | undefined>(undefined)

const store = useStore()
const route = useRoute()

const paramsGetJobs = reactive({ created_by: 'all', projects: [store.selectedProject?.idCore ?? ''] })

const jobId = computed(() => route.fullPath.split('/').pop())
const siteIds = computed(() => store.projectFilters?.locationSites.map(site => { return site.id }))
console.info(siteIds.value)

const { isLoading: isLoadingClassifierJobs, isError: isErrorClassifierJobs, data: classifierJobs } = useClassifierJobs(apiClientCore, paramsGetJobs)

const currentJob = computed(() => classifierJobs.value?.items.find(job => job.id.toString() === jobId.value))
// TODO: add logic to combine datetime, streams params
const paramsDetections = reactive({ start: '2021-04-08T00:00:00.000Z', end: '2022-12-22T00:00:00.000Z', streams: null, classifiers: ((currentJob.value?.classifierId) != null) ? [currentJob.value.classifierId.toString()] : null })
const { isLoading: isLoadingDetectionDetails, isError: isErrorDetectionDetails, mutate: mutateDetections } = useGetDetection(apiClientCore)
console.info(isLoadingClassifierJobs, isLoadingDetectionDetails)
console.info(isErrorClassifierJobs, isErrorDetectionDetails)

watch(() => currentJob.value, () => {
  paramsDetections.classifiers = currentJob.value?.classifierId != null ? [currentJob.value.classifierId.toString()] : null
  mutateDetections(paramsDetections, {
    onSuccess: async (detectionData) => {
      console.info(detectionData)
    }
  })
})

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
  const speciesNames = ['Panthera pardus orientalis', 'Diceros bicornis', 'Gorilla gorilla diehli', 'Gorilla beringei graueri', 'Eretmochelys imbricata', 'Rhinoceros sondaicus', 'Pongo abelii', 'Pongo pygmaeus', 'Pseudoryx nghetinhensis', 'Elephas maximus sumatranus']
  const species = []
  for (let index = 0; index < 2; index++) {
    const rd = Math.floor(Math.random() * 30)
    const media = []
    for (let j = 0; j < rd; j++) {
      media.push({
        spectrogramUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_d120.120_mtrue_fspec.png',
        audioUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_fwav.wav',
        id: rd + j,
        validation: 'unvalidated'
      })
    }
    const speciesName = speciesNames[Math.floor(Math.random() * speciesNames.length)]
    species.push({
      speciesSlug: speciesName,
      speciesName,
      media
    })
  }

  return species
})

const displaySpecies = (media: DetectionMedia[]) => {
  return media.slice(0, Math.min(media.length, MAX_DISPLAY_PER_EACH_SPECIES))
}

const updateSelectedDetections = (detectionId: number, event: DetectionEvent) => {
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

const resetSelection = (skippedId?: number) => {
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (skippedId !== undefined && det.id === skippedId) return
      det.checked = false
    })
  })
}

const selectDetection = (detectionId: number, checked: boolean) => {
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (detectionId === det.id) {
        det.checked = checked
      }
    })
  })
}

const getSelectedDetectionIds = () => {
  const selectedDetectionIds = [] as number[]
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (det.checked === true) {
        selectedDetectionIds.push(det.id)
      }
    })
  })

  return selectedDetectionIds.sort((a, b) => a - b)
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

const validateDetection = (validation: string) => {
  const selectedDetectionIds = getSelectedDetectionIds()
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (selectedDetectionIds.includes(det.id)) {
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
