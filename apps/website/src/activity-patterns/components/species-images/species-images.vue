<template>
  <div>
    <el-carousel
      indicator-position="none"
      :autoplay="false"
    >
      <el-carousel-item
        v-for="(image, idx) in images"
        :key="'species-images-' + idx"
      >
        <div class="relative overflow-hidden rounded-md">
          <div
            class="bg-cover bg-center bg-dark-500 opacity-60 h-75 w-full"
            style="filter: blur(2px)"
            :style="{ backgroundImage: 'url(' + image + ')'}"
          />
          <img
            :src="image"
            :alt="species?.scientificName ?? ''"
            class="absolute top-0 left-0 right-0 mx-auto h-75"
          >
          <div
            v-if="image"
            class="absolute px-2 py-1 bottom-0 w-full text-center bg-dark-500 bg-opacity-70"
          >
            <a
              :href="imageRef"
              target="_blank"
              class="italic hover:underline"
            >Wiki: {{ species?.imageCaption }}</a>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script lang="ts" src="./species-images.ts"></script>
