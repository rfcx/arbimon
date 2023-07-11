<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="flex flex-row gap-4 items-center h-14">
    <button
      type="button"
      class="w-8"
      @click="togglePlay"
    >
      <span v-if="isLoading">.</span>
      <img
        v-else-if="!isPlaying"
        src="@/_assets/landing/media-player/fi_play.svg"
        alt="Play"
      />
      <img
        v-else
        src="@/_assets/landing/media-player/fi_pause.svg"
        alt="Mute"
      />
    </button>
    <div class="w-48">
      <div
        ref="soundbar"
        :class="isPlaying ? 'block' : 'hidden'"
      ></div>
      <div
        class="w-48 flex h-14 items-center"
        :class="!isPlaying ? 'block' : 'hidden'"
      >
        <hr
          class="w-48 mb-3 h-0.3 border-0 bg-frequency"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Howl } from 'howler'
import SiriWave from 'siriwave'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const sound = ref<Howl | null>(null)

const props = defineProps<{
  src: string
}>()

const soundbar = ref<HTMLElement | null>(null)
const siriWave = ref<SiriWave | null>(null)
const isPlaying = ref(false)
const isLoading = ref(false)

onMounted(() => {
  setupSoundBar()
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount')
  sound.value?.stop()
  sound.value = null
  siriWave.value?.stop()
})

const setupSoundBar = () => {
  siriWave.value = new SiriWave({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    container: soundbar.value!,
    width: 192,
    height: 54.5,
    autostart: true,
    speed: 0.2,
    amplitude: 1,
    color: '#ADFF2C',
    curveDefinition: [
      { attenuation: -2, lineWidth: 0, opacity: 0 },
      { attenuation: -6, lineWidth: 0, opacity: 0 },
      { attenuation: 4, lineWidth: 0, opacity: 0 },
      { attenuation: 2, lineWidth: 0, opacity: 0 },
      { attenuation: 1, lineWidth: 2, opacity: 1 }
    ]
  })
  siriWave.value?.stop() // stop the animation to match the audio behavior
}

const setupSoundPlayer = (src: string) => {
  isLoading.value = true
  siriWave.value?.stop()
  if (sound.value) {
    sound.value?.unload()
    sound.value = null
  }
  sound.value = new Howl({
    src,
    preload: true,
    onload: () => {
      isLoading.value = false
      siriWave.value?.start()
    },
    onend: () => {
      isPlaying.value = false
      sound.value?.stop()
      siriWave.value?.stop()
    }
  })
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    if (!sound.value) {
      setupSoundPlayer(props.src)
    }
    sound.value?.play()
    if (!isLoading.value) { // resume the loaded sound
      siriWave.value?.start()
    }
  } else {
    sound.value?.pause()
    siriWave.value?.stop()
  }
}

watch(() => props.src, () => {
  isPlaying.value = false
  siriWave.value?.stop()
  setupSoundPlayer(props.src)
 })

</script>
