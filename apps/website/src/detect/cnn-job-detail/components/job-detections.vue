<template>
  <div class="job-result-wrapper">
    <template
      v-for="species in allSpecies"
      :key="'job-detections-' + species.speciesName"
    >
      <div class="species-title text-lg">
        {{ species.speciesName }}
      </div>
      <div
        v-for="(media, idx) in displaySpecies(species.media)"
        :key="'job-detection-media-' + species.speciesName + idx"
        class="inline-block mt-2 mr-2"
      >
        <detection-item
          :spectrogram-url="media.spectrogramUrl"
          :audio-url="media.audioUrl"
        />
      </div>
      <!-- <router-link
        v-if="species.media.length > MAX_DISPLAY_PER_EACH_SPECIES"
        :to="{ name: ROUTE_NAMES.detectionDetails, params: { speciesSlug:  } }"
      > -->
      <router-link
        v-if="species.media.length > MAX_DISPLAY_PER_EACH_SPECIES"
        class="block font-weight-bold hover:(text-subtle cursor-pointer)"
        to="/"
      >
        SEE MORE+
      </router-link>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import DetectionItem from './detections-item.vue'

const MAX_DISPLAY_PER_EACH_SPECIES = 20

const allSpecies = computed(() => {
  const speciesNames = ['Panthera pardus orientalis', 'Diceros bicornis', 'Pongo pygmaeus', 'Gorilla gorilla diehli', 'Gorilla beringei graueri', 'Eretmochelys imbricata', 'Rhinoceros sondaicus', 'Pongo abelii, Pongo pygmaeus', 'Pseudoryx nghetinhensis', 'Elephas maximus sumatranus']
  const species = []
  for (let index = 0; index < 2; index++) {
    const rd = Math.floor(Math.random() * 30)
    const media = []
    for (let j = 0; j < rd; j++) {
      media.push({
        spectrogramUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_d512.512_mtrue_fspec.png',
        audioUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_fwav.wav'
      })
    }
    species.push({
      speciesName: speciesNames[Math.floor(Math.random() * speciesNames.length)],
      media
    })
  }

  return species
})

const displaySpecies = (media: any[]) => {
  return media.slice(0, Math.min(media.length, MAX_DISPLAY_PER_EACH_SPECIES))
}

</script>
