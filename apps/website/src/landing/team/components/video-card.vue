<template>
  <p
    v-if="isVideoError"
    class="rounded-2xl w-full h-full h-52 bg-moss flex items-center justify-center"
  >
    <span class="text-xs font-medium text-fog">
      It seems the video didn’t load as expected. <br>
      Please refresh your browser to give it another go.
    </span>
  </p>
  <video
    v-else
    :key="src"
    :poster="thumbnailImageSrc"
    autoplay
    muted
    loop
    preload="auto"
    playsinline
    class="rounded-2xl w-full h-full h-52 bg-moss object-cover object-center"
    alt="Video"
    aria-label="Video"
    @error="handleVideoError"
  >
    <source
      :src="src"
      type="video/mp4"
    >
    <image-card
      :src="thumbnailImageSrc"
    />
  </video>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import imageCard from './image-card.vue'

defineProps<{
  src: string,
  thumbnailImageSrc: string
}>()

const isVideoError = ref(false)

const handleVideoError = () => {
  isVideoError.value = true
}
</script>
