<template>
  <div
    class="w-full"
  >
    <section-title title="Distinct species by site">
      <template #controls>
        <map-tool-menu-component
          :map-style="mapStyle"
          @emit-map-style="propagateMapStyle"
          @emit-show-labels-toggle="propagateToggleLabels"
        />
      </template>
    </section-title>
    <no-data-panel
      v-if="!hasData"
      class="h-32 mt-2"
    />
    <div
      v-show="hasData"
      class="grid gap-2 mt-2"
      :class="{ [`xl:grid-cols-${columnCount}`]: true }"
    >
      <map-bubble-component
        v-for="(dataset, idx) in datasets"
        :key="idx"
        :dataset="dataset"
        :data-key="mapDataKey"
        :get-popup-html="getPopupHtml"
        :map-export-name="mapExportName(dataset, idx)"
        :map-id="`species-richness-by-location-${idx}`"
        :map-initial-bounds="mapInitialBounds"
        :map-height="mapHeight"
        :circle-formatter="circleFormatter"
        :map-style="mapStyle"
        :is-show-labels="isShowLabels"
        :circle-style-non-zero="circleStyles[idx]"
        :map-move-event="mapMoveEvent"
        class="w-full"
        @emit-map-moved="propagateMapMove"
      />
    </div>
  </div>
</template>
<script src="./species-richness-by-location.ts" lang="ts"></script>
