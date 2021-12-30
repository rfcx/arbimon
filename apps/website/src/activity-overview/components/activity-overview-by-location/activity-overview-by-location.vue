<template>
  <div class="w-full">
    <div class="flex flex-row justify-between items-center">
      <div class="flex flex-row items-center">
        <select
          v-model="selectedType"
          class="text-xl py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-2 focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-2 ring-0 outline-none)"
        >
          <option
            v-for="item in datasetTypes"
            :key="'detection-location-selector' + item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
        <h2 class="text-white text-xl ml-1">
          by location
        </h2>
      </div>
      <map-tool-menu-component
        :map-style="mapStyle"
        @emit-map-style="propagateMapStyle"
        @emit-show-labels-toggle="propagateToggleLabels"
      />
    </div>
    <div class="mt-2">
      <no-data-panel
        v-if="hasNoData"
        class="h-144"
      />
      <div
        v-else
        class="grid gap-2 mt-2"
        :class="{ [`md:grid-cols-${columnCount}`]: true }"
      >
        <map-bubble-component
          v-for="(dataset, idx) in datasets"
          :key="idx"
          :color="store.datasetColors[idx]"
          :dataset="dataset"
          :data-key="selectedType"
          :get-popup-html="getPopupHtml"
          :map-id="`activity-patterns-detection-by-location-${idx}`"
          :map-initial-bounds="store.selectedProject?.geoBounds ?? null"
          :map-move-event="mapMoveEvent"
          :map-style="mapStyle"
          :map-export-name="mapExportName(dataset, selectedType, idx)"
          :is-show-labels="isShowLabels"
          :max-circle-radius-pixels="maxCircleRadiusPixels"
          class="w-full"
          @emit-map-moved="propagateMapMove"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./activity-overview-by-location.ts"></script>
