<template>
  <div>
    <ul class="flex flex-wrap gap-2">
      <li
        v-for="(image, index) in images"
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
              :src="currentImage.src"
              class="max-w-full max-h-full"
              @error="setErrorImage($event, true)"
            >
          </div>

          <!-- Navigation -->
          <button
            class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl"
            @click="prevImage"
          >
            ‹
          </button>
          <button
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl"
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
