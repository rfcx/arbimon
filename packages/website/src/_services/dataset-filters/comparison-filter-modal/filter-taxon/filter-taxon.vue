<template>
  <div class="max-h-md overflow-auto pt-4">
    <label
      v-for="(taxon) in taxons"
      :key="'site-list-' + taxon.name"
      class="px-4 pb-2 align-middle list-item"
    >
      <input
        type="checkbox"
        class="rounded"
        :checked="isSelectedTaxon(taxon.name)"
        @click="updateSelectedTaxons(taxon.name)"
      >
      <span class="text-white ml-2">{{ taxon.name }} {{ taxon.symbol }}</span>
    </label>
  </div>
</template>

<script src="./filter-taxon.ts" lang="ts"></script>
