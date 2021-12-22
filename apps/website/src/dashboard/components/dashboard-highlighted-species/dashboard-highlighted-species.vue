<template>
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
      :key="'dashboard-highlighted-' + item.speciesId"
      class="flex content-center mb-2"
    >
      <img
        class="h-12 w-12 object-cover mr-2"
        :src="item.imageUrl"
      >
      <router-link
        class="self-center hover:(underline opacity-70)"
        :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectId: store.selectedProject?.id, speciesSlug: item.speciesSlug } }"
      >
        <p class="italic">
          {{ item.scientificName }}
        </p>
        <p class="text-xs text-subtle">
          {{ item.commonName }}
        </p>
        <p class="text-xs">
          {{ item.extinctionRisk.label }}
        </p>
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-highlighted-species.ts"></script>
