<template>
  <!-- TODO #188 #189 Handle loading and error case -->
  <h3 class="text-lg text-subtle border-b-1 border-subtle pb-1">
    Description
  </h3>
  <div class="mt-4">
    <species-information-content
      :content="speciesIUCNCleanContent"
      :redirect-url="iucnSpeciesInformation?.sourceUrl"
      :source="iucnSpeciesInformation?.sourceCite ?? 'IUCN Red List'"
    />
    <species-information-content
      v-if="!speciesIUCNCleanContent"
      class="mt-2"
      :content="wikiSpeciesInformation?.description"
      :redirect-url="wikiSpeciesInformation?.sourceUrl"
      source="Wikipedia"
    />
  </div>
</template>
<script lang="ts" src="./species-background-information.ts"></script>
