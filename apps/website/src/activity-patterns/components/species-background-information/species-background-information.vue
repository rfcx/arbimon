<template>
  <!-- TODO #188 #189 Handle loading and error case -->
  <div v-if="iucnSpeciesInformation || wikiSpeciesInformation">
    <species-information-content-component
      :content="speciesIUCNCleanContent"
      :redirect-url="iucnSpeciesInformation?.sourceUrl"
      :source="iucnSpeciesInformation?.sourceCite ?? 'IUCN Red List'"
    />
    <species-information-content-component
      v-if="!speciesIUCNCleanContent"
      class="mt-2"
      :content="wikiSpeciesInformation?.description"
      :redirect-url="wikiSpeciesInformation?.sourceUrl"
      source="Wikipedia"
    />
  </div>
  <!-- <div class="col-span-1">
    <div class="relative max-h-60 max-w-full flex justify-end">
      <img
        :src="speciesImage()"
        :alt="species?.scientificName ?? ''"
        class="max-h-60"
      >
      <div
        v-if="species?.scientificName"
        class="absolute px-2 py-1 bottom-0 right-0 bg-dark-300 bg-opacity-70"
      >
        <a
          :href="speciesImage()"
          target="_blank"
          class="italic hover:underline"
        >{{ species?.scientificName }}</a>
      </div>
    </div>
  </div> -->
</template>
<script lang="ts" src="./species-background-information.ts"></script>
