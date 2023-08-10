<template>
  <div class="max-h-md overflow-auto pt-4">
    <label
      class="px-4 pb-2 align-middle list-item"
    >
      <input
        type="radio"
        class="rounded"
        :checked="isSelectedAllTaxons"
        @click="selectAllTaxon()"
      >
      <span class="text-insight ml-2">All</span>
    </label>
    <label
      v-for="taxon in taxons"
      :key="'site-list-' + taxon.commonName"
      class="px-4 pb-2 align-middle list-item"
    >
      <input
        type="checkbox"
        class="rounded"
        :checked="isSelectedTaxon(taxon.id)"
        @click="updateSelectedTaxons(taxon.id)"
      >
      <span class="text-insight ml-2">{{ taxon.commonName }}</span>
    </label>
  </div>
</template>

<script src="./filter-taxon.ts" lang="ts"></script>
