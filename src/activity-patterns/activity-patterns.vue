<template>
  <page-title title="Activity Patterns" />
  <select
    v-model="selectedSpeciesSlug"
    class="mt-6 capitalize bg-steel-grey rounded p-2 focus:(border-box-grey ring-0 outline-none) min-w-64"
  >
    <option
      v-for="species in allSpecies"
      :key="'species-name-selector-' + species.speciesId"
      :value="species.speciesSlug"
    >
      {{ species.speciesName }}
    </option>
  </select>
  <comparison-list-component @emitSelect="onFilterChange" />
  <activity-patterns-metrics class="mt-6" />
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
