<template>
  <div
    v-if="!isLoading && speciesInformation"
    class="grid grid-cols-4"
  >
    <div class="col-span-3 px-4 py-2">
      <p>
        {{ speciesInformation?.content }}
      </p>
      <p class="mt-4 text-right">
        Source:
        <a
          :href="redirectToWiki()"
          target="_blank"
          class="opacity-80 hover:(underline opacity-70)"
        >
          Wikipedia
        </a>
      </p>
    </div>
    <div class="col-span-1 place-self-center">
      <img
        :src="speciesInformation?.thumbnail?.source"
        class="object-contain max-h-50"
      >
    </div>
  </div>
</template>
<script lang="ts" src="./species-information.ts"></script>
