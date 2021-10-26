<template>
  <!-- TODO #188 #189 Handle loading and error case -->
  <div
    v-if="speciesInformation"
    class="grid grid-cols-4"
  >
    <div class="col-span-3 pr-6">
      <p>
        {{ speciesInformation?.content }}
        <span class="mt-2 text-right text-subtle">
          &mdash; <a
            :href="speciesWikiUrl"
            target="_blank"
            class="opacity-80 hover:(underline opacity-70)"
          >
            Source: Wikipedia
          </a>
        </span>
      </p>
    </div>
    <div class="col-span-1">
      <img
        :src="speciesImage(speciesInformation?.thumbnailImage)"
        :alt="species.speciesName"
        class="object-contain max-h-50"
      >
    </div>
  </div>
</template>
<script lang="ts" src="./species-background-information.ts"></script>
