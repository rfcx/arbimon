<template>
  <page-title
    page-title="Activity Patterns"
    page-subtitle="Trends in detections and occupancy"
  >
    <dropdown-menu>
      <dropdown-menu-item>
        <icon-fas-hammer class="mr-2" /> TODO
      </dropdown-menu-item>
    </dropdown-menu>
  </page-title>
  <comparison-list-component @emitSelect="onFilterChange" />
  <select
    v-model="selectedSpeciesSlug"
    class="capitalize bg-steel-grey rounded p-2 my-6 focus:(border-box-grey ring-0 outline-none) min-w-64"
  >
    <option
      v-for="species in allSpecies"
      :key="'species-name-selector-' + species.speciesId"
      :value="species.speciesSlug"
    >
      {{ species.speciesName }}
    </option>
  </select>
  <species-background-information :species-name="selectedSpeciesName" />
  <activity-patterns-metrics class="mt-6" />
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
