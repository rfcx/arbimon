<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="flex flex-row gap-4 items-center h-14">
    <button
      type="button"
      class="w-8"
      @click="togglePlay"
    >
      <icon-fas-spinner
        v-if="isLoading"
        class="animate-spin"
        aria-label="Loading"
      />
      <img
        v-else-if="!isPlaying"
        src="@/_assets/landing/media-player/fi_play.svg"
        alt="Play"
      />
      <img
        v-else
        src="@/_assets/landing/media-player/fi_pause.svg"
        alt="Pause"
      />
    </button>
    <div class="w-48">
      <div
        ref="soundbar"
        class="mt-4"
      ></div>
      <!-- <div
        class="w-48 flex h-14 items-center"
        :class="!isPlaying ? 'block' : 'hidden'"
      >
        <hr
          class="w-48 mb-5 h-0.2 border-0 bg-frequency"
        >
      </div> -->
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
  // setupSoundPlayer(props.src)
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
  isPlaying.value = false
  if (sound.value) {
    sound.value?.unload()
    sound.value = null
  }
  sound.value = new Howl({
    src,
    onload: () => {
      isLoading.value = false
    },
    onend: () => {
      isPlaying.value = false
      sound.value?.stop()
    }
  })
}

const togglePlay = async () => {
  if (!sound.value) {
    await setupSoundPlayer(props.src)
  }
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    sound.value?.play()
  } else {
    sound.value?.pause()
  }
}

watch(() => props.src, () => {
  isPlaying.value = false
  siriWave.value?.stop()
  setupSoundPlayer(props.src)
 })

 watch(() => isPlaying.value, () => {
  if (isPlaying.value) {
    siriWave.value?.start()
  } else {
    siriWave.value?.stop()
  }
 })

</script>
