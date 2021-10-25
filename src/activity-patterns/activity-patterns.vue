<template>
  <page-title class="mb-6">
    <template #title>
      Activity Patterns
    </template>
  </page-title>
  <select
    v-model="selectedSpeciesSlug"
    class="capitalize bg-steel-grey rounded p-2 focus:(border-box-grey ring-0 outline-none) min-w-64"
  >
    <option
      v-for="item in species"
      :key="'species-name-selector-' + item.speciesId"
      :value="item.speciesSlug"
    >
      {{ item.speciesName }}
    </option>
  </select>
  <comparison-list-component @emitSelect="onFilterChange" />
  <div class="mt-6">
    <activity-patterns-metrics />
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
