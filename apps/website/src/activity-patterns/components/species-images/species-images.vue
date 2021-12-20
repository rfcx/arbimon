<template>
  <div class="text-lg">
    Photo
  </div>
  <div class="max-h-60 max-w-full my-4 flex justify-left">
    <div class="relative">
      <img
        :src="speciesImage()"
        :alt="species?.scientificName ?? ''"
        class="max-h-60"
      >
      <div
        v-if="species?.scientificName"
        class="absolute px-2 py-1 bottom-0 w-full text-right bg-dark-300 bg-opacity-70"
      >
        <a
          :href="speciesImage()"
          target="_blank"
          class="italic hover:underline"
        >{{ species?.scientificName }}</a>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./species-images.ts"></script>
