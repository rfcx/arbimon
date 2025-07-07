<template>
  <div>
    <ul class="flex flex-wrap gap-2">
      <li
        v-for="(image, index) in images.slice(0, 2)"
        :key="image.id"
        class="cursor-pointer p-1 rounded"
        @click="openModal(index)"
      >
        <img
          :src="image.src"
          class="w-[100px] h-[100px] object-cover"
          @error="setErrorImage($event)"
        >
      </li>

      <li
        v-if="images.length >= 3"
        class="cursor-pointer p-1 rounded relative"
        @click="openModal(images.length > 3 ? 3 : 2)"
      >
        <img
          :src="images[2].src"
          class="w-[100px] h-[100px] object-cover"
          @error="setErrorImage($event)"
        >
        <span
          v-if="images.length > 3"
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white font-bold text-xl"
        >
          +{{ images.length - 3 }}
        </span>
      </li>
    </ul>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
      >
        <div class="relative max-w-3xl w-full h-[80vh]">
          <button
            class="absolute top-2 right-2 text-white text-2xl"
            @click="closeModal"
          >
            ✕
          </button>

          <div class="h-full flex items-center justify-center">
            <img
              :src="currentImage?.src"
              class="max-w-full max-h-full"
              @error="setErrorImage($event, true)"
            >
          </div>

          <!-- Navigation -->
          <button
            class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-7xl"
            style="text-shadow: 2px 2px 6px rgba(0,0,0,0.6);"
            @click="prevImage"
          >
            ‹
          </button>
          <button
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-7xl"
            style="text-shadow: 2px 2px 6px rgba(0,0,0,0.6);"
            @click="nextImage"
          >
            ›
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface Image {
  id: number | string
  src: string
  label?: string
}

const props = defineProps<{
  images: Image[]
}>()

const showModal = ref(false)
const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value])

function openModal (index: number) {
  currentIndex.value = index
  showModal.value = true
}

function closeModal () {
  showModal.value = false
}

function prevImage () {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function nextImage () {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function setErrorImage (event: Event, isFull = false) {
  const img = event.target as HTMLImageElement
  img.src = isFull
    ? 'https://rfcx-web-static.s3.eu-west-1.amazonaws.com/arbimon/unavaliable.png'
    : 'https://rfcx-web-static.s3.eu-west-1.amazonaws.com/arbimon/unavailable-square.png'
}
</script>
