<template>
  <div>
    <select
      v-model="selectedSpecies"
      class="bg-steel-grey rounded p-2 focus:(border-box-grey ring-0 outline-none) min-w-64"
    >
      <option
        v-for="item in species"
        :key="'species-name-selector-' + item.speciesId"
        :value="item.speciesId"
      >
        {{ item.speciesName }}
      </option>
    </select>
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
