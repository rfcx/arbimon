<template>
  <div class="w-full rounded-2xl bg-steel-grey my-4 p-4 flex justify-between">
    <div class="font-semibold">
      Endangered species
    </div>
    <router-link
      class="flex hover:(underline opacity-70)"
      :to="{ name: ROUTE_NAMES.activityOverview, params: { projectId: store.selectedProject?.id } }"
    >
      <div>
        Compare
      </div>
      <icon-fas-angle-right class="font-semibold self-center" />
    </router-link>
  </div>
  <no-data-panel
    v-if="!hasData"
    class="h-20"
  />
  <div
    v-else
    class="ml-2"
  >
    <div
      v-for="item in species"
      :key="'dashboard-endangered-' + item.speciesId"
      class="flex content-center mb-2"
    >
      <img
        class="h-16 w-16 object-cover mr-2"
        :src="item.imageUrl"
      >
      <router-link
        class="self-center hover:(underline opacity-70)"
        :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectId: store.selectedProject?.id, speciesSlug: item.speciesSlug } }"
      >
        <p class="text-lg italic">
          {{ item.speciesName }}
        </p>
        <p>
          {{ item.extinctionRisk.label }}
        </p>
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-endangered-species.ts"></script>
