<template>
  <div class="text-lg">
    Photo
  </div>
  <div class="relative max-h-48 max-w-full my-4 flex justify-center">
    <img
      :src="speciesImage()"
      :alt="species?.scientificName ?? ''"
      class="max-h-48"
    >
    <div
      v-if="species?.scientificName"
      class="absolute px-2 py-1 bottom-0 w-full text-center bg-dark-300 bg-opacity-70"
    >
      <a
        :href="speciesImage()"
        target="_blank"
        class="italic hover:underline"
      >{{ species?.scientificName }}</a>
    </div>
  </div>
</template>
<script lang="ts" src="./species-images.ts"></script>
