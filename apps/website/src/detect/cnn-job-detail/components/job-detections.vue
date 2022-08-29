<template>
  <div class="job-result-wrapper">
    <template
      v-for="species in speciesMedias"
      :key="'job-detections-' + species.speciesName"
    >
      <span class="text-lg">{{ species.speciesName }}</span>
      <template
        v-for="(media, idx) in species.media"
        :key="'job-detection-media-' + species.speciesName + idx"
      >
        <detection-item
          :spectrogram-url="media.spectrogramUrl"
          :audio-url="media.audioUrl"
        />
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import DetectionItem from './detections-item.vue'

const speciesMedias = [
  {
    speciesName: 'Cat',
    media: [
      {
        spectrogramUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_d512.512_mtrue_fspec.png',
        audioUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_fwav.wav'
      }
    ]
  }
]

</script>
