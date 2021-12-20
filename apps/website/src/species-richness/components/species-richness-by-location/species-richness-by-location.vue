<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end">
      <h2 class="text-white text-xl">
        Distinct species by site
      </h2>
      <map-tool-menu-component
        :map-style="mapStyle"
        @emit-map-style="propagateMapStyle"
        @emit-show-labels-toggle="propagateToggleLabels"
      />
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
        :data-key="mapDataKey"
        :get-popup-html="getPopupHtml"
        :map-id="`species-richness-by-location-${idx}`"
        :map-move-event="mapMoveEvent"
        :map-style="mapStyle"
        :map-export-name="mapExportName(dataset)"
        :is-show-labels="isShowLabels"
        class="w-full"
        @emit-map-moved="propagateMapMove"
      />
    </div>
  </div>
</template>
<script src="./species-richness-by-location.ts" lang="ts"></script>
