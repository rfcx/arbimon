<template>
  <!-- TODO #188 #189 Handle loading and error case -->
  <div
    v-if="speciesInformation"
    class="flex gap-10"
  >
    <div>
      <p>
        {{ speciesInformation?.content }}
        <span class="mt-2 text-subtle">
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
    <div>
      <img
        :src="speciesImage(speciesInformation?.thumbnailImage)"
        :alt="species?.speciesName ?? ''"
        class="object-contain min-w-40 md:min-w-50 lg:min-w-60"
      >
    </div>
  </div>
</template>
<script lang="ts" src="./species-background-information.ts"></script>
