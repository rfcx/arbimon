<template>
  <div class="w-full rounded-2xl bg-steel-grey my-4 p-4 flex justify-between">
    <div class="font-semibold">
      Highlighted species
    </div>
    <router-link
      class="flex hover:(underline opacity-70)"
      :to="{ name: activityOverview, params: { projectId } }"
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
        :src="speciesImage(item.thumbnailImageUrl)"
      >
      <router-link
        class="self-center hover:(underline opacity-70)"
        :to="{ name: activityPatternRoutename, params: { projectId, speciesSlug: item.speciesSlug } }"
      >
        <p class="text-lg italic">
          {{ item.speciesName }}
        </p>
        <p v-if="item.speciesCategory">
          {{ displayCategory(item.speciesCategory) }}
        </p>
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-highlighted-species.ts"></script>
