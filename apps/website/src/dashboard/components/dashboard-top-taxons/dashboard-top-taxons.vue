<template>
  <div class="w-full rounded-2xl bg-steel-grey mb-4 p-4">
    <router-link
      class="flex justify-between"
      :to="{ name: ROUTE_NAMES.speciesRichness, params: { id: store.selectedProject?.id } }"
    >
      <div class="font-semibold">
        Richness
      </div>
      <div class="flex">
        {{ speciesCount }} species
        <icon-fas-angle-right class="font-semibold self-center" />
      </div>
    </router-link>
  </div>
  <horizontal-stacked-distribution
    :dataset="dataset"
    :colors="colors"
    :known-total-count="speciesCount"
  />
</template>
<script lang="ts" src="./dashboard-top-taxons.ts"></script>
