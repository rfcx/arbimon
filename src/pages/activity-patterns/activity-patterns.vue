<template>
  <div id="activity-patterns">
    <form>
      <select
        v-model="selectedSpecies"
        class="bg-steel-grey rounded p-2 focus:(border-box-grey ring-0 outline-none) min-w-64"
      >
        <option
          v-for="(name, idx) in species"
          :key="'species-name-selector-' + idx"
          :value="name"
        >
          {{ name }}
        </option>
      </select>
    </form>
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
