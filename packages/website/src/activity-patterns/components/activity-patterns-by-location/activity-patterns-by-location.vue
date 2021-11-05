<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end">
      <h2 class="text-white text-xl">
        Detection frequency by site
      </h2>
    </div>
    <no-data-panel
      v-if="!hasData"
      class="h-32 mt-2"
    />
    <div
      v-show="hasData"
      class="grid gap-2 mt-2"
      :class="{ [`md:grid-cols-${columnCount}`]: true }"
    >
      <map-bubble-component
        v-for="(dataset, idx) in datasets"
        :key="idx"
        :dataset="dataset"
        :taxon="taxon"
        :map-id="`activity-patterns-by-location-${idx}`"
        :map-config="config"
        :map-style="mapStyle"
        :map-export-name="mapExportName(dataset)"
        :is-show-labels="isShowLabels"
        class="w-full"
        @emit-map-moved="mapMoved"
      />
    </div>
  </div>
</template>
<script src="./activity-patterns-by-location.ts" lang="ts"></script>
