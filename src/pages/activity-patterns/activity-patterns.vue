<template>
  <div id="activity-patterns">
    <select
      v-model="selectedSpecies"
      class="bg-steel-grey rounded p-2"
    >
      <option
        v-for="(name, idx) in species"
        :key="'species-name-selector-' + idx"
        :value="name"
      >
        {{ name }}
      </option>
    </select>
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
