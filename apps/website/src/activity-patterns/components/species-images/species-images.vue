<template>
  <div>
    <div
      v-if="loading"
      class="loading-shimmer h-40"
    />
    <no-data-panel v-else-if="speciesPhotos.length === 0" />
    <el-carousel
      v-else
      indicator-position="none"
      :autoplay="false"
    >
      <el-carousel-item
        v-for="(photo, idx) in speciesPhotos"
        :key="'species-images-' + idx"
      >
        <div class="relative overflow-hidden rounded-md">
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
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script lang="ts" src="./species-images.ts"></script>
