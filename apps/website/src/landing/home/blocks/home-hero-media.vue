<template>
  <div class="relative hidden lg:mt-0 lg:col-span-5 lg:flex">
    <span class="sr-only">Sound of the {{ items[currentItemIndex].title }}</span>
    <img
      class="object-center object-cover w-full h-full"
      :src="items[currentItemIndex].imageUrl"
      :alt="items[currentItemIndex].title"
    >
    <div class="absolute bottom-4 w-100 h-48 flex flex-col items-center gap-2 border-1 px-2 py-4 border-chirp rounded-lg bg-black bg-opacity-75">
      <media-player :src="items[currentItemIndex].audioUrl" />
      <div class="text-center shrink-0 h-20 px-2">
        <p>{{ items[currentItemIndex].title }}</p>
        <p class="text-sm">
          {{ items[currentItemIndex].description }}
        </p>
      </div>
      <div class="flex flex-row gap-2 items-center">
        <button
          type="button"
          class="text-frequency"
          @click="currentItemIndex = (currentItemIndex !== 0) ? currentItemIndex - 1 : items.length - 1"
        >
          &lt;
        </button>
        <div class="flex space-x-1 justify-center">
          <button
            v-for="(item, index) in items"
            :key="index"
            type="button"
            class="w-2 h-2 rounded-full border-insight border-1"
            :aria-current="currentItemIndex === index"
            :aria-label="(index + 1) + ' of ' + items.length"
            :data-carousel-slide-to="index"
            :class="{ 'bg-insight': currentItemIndex === index }"
            @click="currentItemIndex = index"
          />
        </div>
        <button
          type="button"
          class="text-frequency"
          @click="currentItemIndex = (currentItemIndex + 1 !== items.length) ? currentItemIndex + 1 : 0"
        >
          >
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import birdImage from '@/_assets/default-species-image.jpg'
import frogImage from '@/_assets/landing/media-player/ameerega-trivittata.png'
import frogSound from '@/_assets/landing/media-player/ameerega-trivittata.wav'
import monkeyImage from '@/_assets/landing/media-player/hylobates-agilis.png'
import monkeySound from '@/_assets/landing/media-player/hylobates-agilis.wav'
import birdSound from '@/_assets/landing/media-player/psilopogon-pyrolophus.wav'
import MediaPlayer from '../components/media-player.vue'
import { type MediaHeroContent } from '../data/type'

const currentItemIndex = ref<number>(0)
const items = ref<Array<MediaHeroContent>>([
  {
    id: 1,
    title: 'Agile Gibbon (Hylobates agilis)',
    description: 'Endangered (IUCN RedList) Detected 2488 times in 21 sites in 1 country',
    imageUrl: monkeyImage,
    audioUrl: monkeySound
  },
  {
    id: 2,
    title: 'Three-striped Poison Frog (Ameerega trivittata)',
    description: 'Detected 34 times in 12 sites and 2 countries',
    imageUrl: frogImage,
    audioUrl: frogSound
  },
  {
    id: 3,
    title: 'Fire-tufted Barbet (Psilopogon pyrolophus)',
    description: 'Detected 123 times in 1 site and 1 country',
    imageUrl: birdImage,
    audioUrl: birdSound
  }
])

</script>
