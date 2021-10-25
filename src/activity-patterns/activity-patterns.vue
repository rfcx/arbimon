<template>
  <page-title class="mb-6">
    <template #title>
      Activity Patterns
    </template>
  </page-title>
  <comparison-list-component @emitSelect="onFilterChange" />
  <select
    v-model="selectedSpeciesSlug"
    class="capitalize bg-steel-grey rounded p-2 my-6 focus:(border-box-grey ring-0 outline-none) min-w-64"
  >
    <option
      v-for="item in species"
      :key="'species-name-selector-' + item.speciesId"
      :value="item.speciesSlug"
    >
      {{ item.speciesName }}
    </option>
  </select>
  <species-background-information :species-name="selectedSpeciesName" />
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
