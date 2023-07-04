<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="flex flex-row gap-4">
    <div ref="soundbar"></div>
    <button
      type="button"
      @click="togglePlay"
    >
      <img
        v-if="!isPlaying"
        src="src/_assets/landing/media-player/fi_volume-play.svg"
        alt="Play"
      />
      <img
        v-else
        src="src/_assets/landing/media-player/fi_volume-mute.svg"
        alt="Mute"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import SiriWave from 'siriwave'
import { onMounted, ref } from 'vue'

const soundbar = ref<HTMLElement | null>(null)
const siriWave = ref<SiriWave | null>(null)
const isPlaying = ref(false)

onMounted(() => {
  siriWave.value = new SiriWave({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    container: soundbar.value!,
    width: 200,
    height: 40,
    autostart: true,
    speed: 0.2,
    amplitude: 1,
    color: '#ADFF2C'
  })
  togglePlay()
})

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    siriWave.value?.start()
  } else {
    siriWave.value?.stop()
  }
}

</script>
