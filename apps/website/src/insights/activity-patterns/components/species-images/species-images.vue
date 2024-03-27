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
      class="relative group"
    >
      <button
        class="absolute left-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-gray bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
        @click="scrollContent('left')"
      >
        <icon-custom-chevron-left class="text-xxs m-auto" />
      </button>
      <div
        class="relative overflow-hidden rounded-md"
      >
        <div
          id="carousel-container"
        >
          <div
            v-for="(photo, idx) in speciesPhotos"
            :key="'species-images-' + idx"
            class="scroll-snap-align-start"
          >
            <div class="relative">
              <div
                class="bg-cover bg-center bg-dark-500 opacity-60 h-75 w-full"
                style="filter: blur(2px)"
                :style="{ backgroundImage: 'url(' + handleImageUrl(photo.photoUrl) + ')'}"
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
        </div>
      </div>
      <button
        class="absolute right-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-gray bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
        @click="scrollContent('right')"
      >
        <icon-custom-chevron-right class="text-xxs m-auto" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaxonSpeciesPhotoTypes } from '@rfcx-bio/common/dao/types'

withDefaults(defineProps<{ speciesPhotos: Array<TaxonSpeciesPhotoTypes['light']>, loading: boolean }>(), {
  loading: false
})

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

const SCROLL_STEP = 150
type ScrollDirection = 'left' | 'right'

const scrollContent = (direction: ScrollDirection = 'left'): void => {
  const content = document.querySelector('#carousel-container')
  if (!content) return

  if (direction === 'left') {
    content.scrollLeft -= SCROLL_STEP
  } else {
    content.scrollLeft += SCROLL_STEP
  }
}
</script>
