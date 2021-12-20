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
</template>
<script lang="ts" src="./species-background-information.ts"></script>
