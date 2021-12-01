<template>
  <select
    v-model="selectedSpeciesSlug"
    class="bg-steel-grey rounded p-2 my-6 focus:(border-box-grey ring-0 outline-none) min-w-64"
  >
    <option
      v-for="species in allSpecies"
      :key="'species-selector-' + species.speciesId"
      :value="species.speciesSlug"
      class="italic"
    >
      {{ species.speciesName }}
    </option>
  </select>
</template>
<script src="./species-selector.ts" lang="ts"></script>
