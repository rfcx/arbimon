<template>
  <div
    class="w-full"
  >
    <section-title title="Distinct species by site">
      <template #controls>
        <map-tool-menu-component
          :map-ground-style="mapGroundStyle"
          :map-statistics-style="mapStatisticsStyle"
          @emit-map-ground-style="propagateMapGroundStyle"
          @emit-map-statistics-style="propagateMapStatisticsStyle"
          @emit-show-labels-toggle="propagateToggleLabels"
        />
      </template>
    </section-title>
    <div
      class="grid gap-2 mt-2"
      :class="{ [`xl:grid-cols-${columnCount}`]: true }"
    >
      <map-base-component
        v-for="(dataset, idx) in datasets"
        :key="'species-richness-by-location-' + idx"
        :dataset="dataset"
        :data-key="mapDataKey"
        :loading="loading"
        :get-popup-html="getPopupHtml"
        :map-export-name="mapExportName(dataset, idx)"
        :map-id="`species-richness-by-location-${idx}`"
        :map-initial-bounds="mapInitialBounds"
        :map-base-formatter="circleFormatter"
        :map-ground-style="mapGroundStyle"
        :map-statistics-style="mapStatisticsStyle"
        :is-show-labels="isShowLabels"
        :style-non-zero="circleStyles[idx]"
        :map-move-event="mapMoveEvent"
        class="w-full"
        @emit-map-moved="propagateMapMove"
      />
    </div>
  </div>
</template>
<script src="./species-richness-by-location.ts" lang="ts"></script>
