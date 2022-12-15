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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import DetectionItem from './detection-item.vue'
import DetectionValidator from './detection-validator.vue'
import { DetectionMedia, DetectionValidationStatus } from './types'

const MAX_DISPLAY_PER_EACH_SPECIES = 20
let selectedDetections: number[] = []

const filterOptions: DetectionValidationStatus[] = [
  { value: 'present', label: 'Present', checked: false },
  { value: 'not_present', label: 'Not Present', checked: false },
  { value: 'unknown', label: 'Unknown', checked: false },
  { value: 'unvalidated', label: 'Unvalidated', checked: true }
]

const validationCount = ref<number | null>(null)
const isOpen = ref<boolean | null>(null)

const route = useRoute()
const jobId = computed(() => route.params.jobId)

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

const updateSelectedDetections = (detectionId: number) => {
  const detectionsIdx = selectedDetections.findIndex(d => d === detectionId)
  if (detectionsIdx === -1) {
    selectedDetections.push(detectionId)
  } else {
    selectedDetections.splice(detectionsIdx, 1)
  }
  validationCount.value = selectedDetections.length
  isOpen.value = true
}

const validateDetection = (validation: string) => {
  allSpecies.value.forEach(species => {
    species.media.forEach((det: DetectionMedia) => {
      if (selectedDetections.includes(det.id)) {
        det.validation = validation
        det.checked = false
      }
    })
  })
  validationCount.value = null
  selectedDetections = []
  isOpen.value = false
}

const closeValidator = () => {
  isOpen.value = false
}

</script>
