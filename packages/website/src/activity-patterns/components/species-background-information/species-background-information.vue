<template>
  <!-- TODO #188 #189 Handle loading and error case -->
  <div
    v-if="iucnSpeciesInformation"
    class="grid grid-cols-4"
  >
    <div class="col-span-3 pr-6">
      <p>
        <span
          v-if="!iucnSpeciesInformation?.content"
          class="italic"
        >
          Not found information.
        </span>
        {{ speciesIUCNCleanContent }}
        <span class="mt-2 text-right text-subtle">
          &mdash; <a
            :href="speciesIUCNUrl"
            target="_blank"
            class="opacity-80 hover:(underline opacity-70)"
          >
            Source: IUCN Red List
          </a>
        </span>
      </p>
      <p
        v-if="!iucnSpeciesInformation?.content"
        class="mt-2"
      >
        <span
          v-if="!wikiSpeciesInformation?.content"
          class="italic"
        >
          Not found information.
        </span>
        {{ wikiSpeciesInformation?.content }}
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
      <div class="relative max-h-60 max-w-full flex justify-end">
        <img
          :src="speciesImage()"
          :alt="species?.speciesName ?? ''"
          class="max-h-60"
        >
        <div
          v-if="species?.speciesName"
          class="absolute px-2 py-1 bottom-0 right-0 bg-dark-300 bg-opacity-70"
        >
          <span v-if="isLoading">Loading...</span>
          <a
            v-else
            :href="speciesImage()"
            target="_blank"
            class="hover:underline"
          >{{ species?.speciesName }}</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./species-background-information.ts"></script>
