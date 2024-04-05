<template>
  <div>
    <div
      v-if="loading"
      class="loading-shimmer h-40"
    />
    <no-data-panel v-else-if="speciesPhotos.length === 0" />
    <div
      v-else
      indicator-position="none"
      :autoplay="false"
      class="overflow-hidden relative group"
    >
      <div
        ref="carousel"
        class="w-full flex transition-transform duration-300 ease-in-out"
      >
        <div
          v-for="(photo, idx) in speciesPhotos"
          :key="'species-images-' + idx"
          class="inline-block w-full"
          :class="{ 'hidden': idx !== currentIdx }"
        >
          <div class="relative overflow-hidden rounded-md">
            <div
              class="bg-cover bg-center bg-dark-500 opacity-60 h-75 w-full blur-[2px]"
              :style="{ backgroundImage: 'url(' + handleImageUrl(photo.photoUrl) + ')' }"
            />
            <img
              :src="handleImageUrl(photo.photoUrl)"
              :alt="photo.photoCaption ?? ''"
              class="absolute top-0 left-0 right-0 mx-auto h-75"
            >
            <div
              class="absolute px-2 py-1 bottom-0 w-full text-center bg-dark-500 bg-opacity-70"
            >
              <a
                :href="photo.photoLicenseUrl"
                target="_blank"
                class="italic hover:(underline cursor-pointer)"
              >
                {{ imageDescription(photo) }}
              </a>
            </div>
          </div>
        </div>
        <button
          class="absolute left-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-gray bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
          :class="{ 'opacity-30': speciesPhotos.length === 1 }"
          @click="prevSlide"
        >
          <icon-custom-chevron-left class="text-xxs m-auto" />
        </button>
        <button
          class="absolute right-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-gray bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
          :class="{ 'opacity-30': speciesPhotos.length === 1 }"
          @click="nextSlide"
        >
          <icon-custom-chevron-right class="text-xxs m-auto" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import type { TaxonSpeciesPhotoTypes } from '@rfcx-bio/common/dao/types'

const { speciesPhotos, loading } = defineProps<{ speciesPhotos: Array<TaxonSpeciesPhotoTypes['light']>, loading: boolean}>()

const handleImageUrl = (url: string): string => {
  const isValidUrl = /^https:\/\/./i.test(url)
  return isValidUrl ? url : new URL('../../../_assets/default-species-image.jpg', import.meta.url).toString()
}

const imageDescription = (image: TaxonSpeciesPhotoTypes['light']): string => {
  return `${image.photoAuthor} - ${licenseCatagory(image.photoLicense)}`
}

const licenseCatagory = (imageLicense: TaxonSpeciesPhotoTypes['light']['photoLicense']): string => {
  const freeLicenses = ['CC0', 'Copyrighted free use', 'Public domain']
  if (freeLicenses.includes(imageLicense)) return `no rights reserved (${imageLicense})`
  return `some rights reserved (${imageLicense})`
}

const carousel = ref<HTMLDivElement | null>(null)
const currentIdx = ref(0)

const nextSlide = () => {
  currentIdx.value = (currentIdx.value + 1) % speciesPhotos.length
}

const prevSlide = () => {
  currentIdx.value = (currentIdx.value - 1 + speciesPhotos.length) % speciesPhotos.length
}
</script>
