<template>
  <video
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
import imageCard from './image-card.vue'

defineProps<{
  src: string,
  thumbnailImageSrc: string
  }>()
</script>
