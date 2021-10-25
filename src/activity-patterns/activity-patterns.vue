<template>
  <div class="flex flex-row justify-between items-center w-full">
    <page-title
      page-title="Activity Patterns"
      page-subtitle="Trends in detections and occupancy"
    />
    <dropdown-menu>
      <dropdown-menu-item>
        <icon-fas-hammer class="mr-2" /> TODO
      </dropdown-menu-item>
    </dropdown-menu>
  </div>

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
