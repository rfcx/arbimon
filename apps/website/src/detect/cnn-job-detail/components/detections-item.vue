<template>
  <div class="detection-item-container relative w-18 h-18 border-1 border-box-grey">
    <div
      v-if="spectrogramLoading"
      class="absolute top-0 bottom-0 left-0 right-0 w-4 h-4 m-auto"
    >
      <icon-fas-spinner class="animate-spin" />
    </div>
    <img
      v-else-if="spectrogram"
      :src="spectrogram"
    >
    <div
      v-else
      class="absolute top-0 bottom-0 left-0 right-0 w-4 h-4 m-auto"
    >
      <icon-fa-close class="text-danger" />
    </div>
    <div
      v-if="!spectrogramLoading && spectrogram"
      class="absolute bottom-2 right-2"
    >
      <audio-controller
        :playing="playing"
        :loading="audioLoading"
        size="xs"
        @click="playing ? stop() : play()"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { Howl } from 'howler'
import { inject, onMounted, ref, withDefaults } from 'vue'

import { apiBioGetCoreMedia } from '@rfcx-bio/common/api-bio/core-proxy/core-media'

import { apiClientBioKey } from '@/globals'

const props = withDefaults(defineProps<{
  spectrogramUrl: string | null
  audioUrl: string | null
}>(), {
  spectrogramUrl: null,
  audioUrl: null
})

const spectrogramLoading = ref(false)
const audioLoading = ref(false)

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const audio = ref<Howl | null>(null)
const spectrogram = ref<string | null>(null)
const playing = ref(false)

onMounted(async () => {
  spectrogramLoading.value = true
  const spectrogramBlob = props.spectrogramUrl ? await apiBioGetCoreMedia(apiClientBio, props.spectrogramUrl) : null
  if (spectrogramBlob) {
    spectrogram.value = window.URL.createObjectURL(spectrogramBlob)
  }
  spectrogramLoading.value = false
})

const setAudio = (audioBlob: Blob) => {
  audio.value = new Howl({
    src: window.URL.createObjectURL(audioBlob),
    html5: true,
      onend: () => {
        playing.value = false
      },
      onpause: () => {
        playing.value = false
      },
      onplay: () => {
        playing.value = true
      },
      onstop: () => {
        playing.value = false
      }
  })
}

const play = async () => {
  if (!audio.value) {
    audioLoading.value = true
    const audioBlob = props.audioUrl ? await apiBioGetCoreMedia(apiClientBio, props.audioUrl) : null
    if (audioBlob) {
      setAudio(audioBlob)
    }
    audioLoading.value = false
  }
  audio.value?.play()
}

const stop = () => {
  audio.value?.stop()
}

</script>
