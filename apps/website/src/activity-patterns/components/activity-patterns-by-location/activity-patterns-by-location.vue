<template>
  <div
    class="w-full"
  >
    <div class="flex flex-row justify-between items-center">
      <div class="flex flex-row items-center">
        <select
          v-model="selectedType"
          class="text-xl py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-2 focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-2 ring-0 outline-none)"
        >
          <option
            v-for="item in datasetTypes"
            :key="'location-selector' + item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
        <h2 class="text-white text-xl ml-1">
          by site
        </h2>
      </div>
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
        :data-key="selectedType"
        :get-popup-html="getPopupHtml"
        :map-export-name="mapExportName(dataset, selectedType, idx)"
        :map-id="`activity-patterns-by-location-${idx}`"
        :map-initial-bounds="store.selectedProject?.geoBounds ?? null"
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
<script src="./activity-patterns-by-location.ts" lang="ts"></script>
